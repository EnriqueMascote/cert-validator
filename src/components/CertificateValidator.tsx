import { useState, useRef, useEffect } from 'react';
import forge from 'node-forge';
import Swal from 'sweetalert2';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import './CertificateValidator.css';

interface CertificateInfo {
  subject: string;
  issuer: string;
  notBefore: string;
  notAfter: string;
  isValid: boolean;
  serialNumber: string;
}

interface ValidationResult {
  success: boolean;
  message: string;
}

const CertificateValidator = () => {
  const [certFile, setCertFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [converting, setConverting] = useState<boolean>(false);
  const [pemData, setPemData] = useState<string | null>(null);
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const passwordRef = useRef<string>('');

  // Secure cleanup on unmount
  useEffect(() => {
    return () => {
      secureCleanup();
    };
  }, []);

  const secureCleanup = () => {
    // Clear password from memory (best effort in JavaScript)
    if (passwordRef.current) {
      passwordRef.current = '\0'.repeat(passwordRef.current.length);
      passwordRef.current = '';
    }
    setPassword('');
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Helper function to properly decode UTF-8 strings from certificates
  const decodeAttributeValue = (value: string): string => {
    try {
      if (value.includes('Ã')) {
        const bytes = new Uint8Array(value.split('').map(c => c.charCodeAt(0)));
        return new TextDecoder('utf-8').decode(bytes);
      }
      return value;
    } catch {
      return value;
    }
  };

  // Parse and display certificate info immediately
  const parseCertificateInfo = async (file: File) => {
    try {
      const certData = await readFileAsText(file);
      const certificate = forge.pki.certificateFromPem(certData);

      const notBefore = certificate.validity.notBefore;
      const notAfter = certificate.validity.notAfter;
      const now = new Date();
      const isValid = now >= notBefore && now <= notAfter;

      const subject = certificate.subject.attributes
        .map((attr) => {
          const value = decodeAttributeValue(attr.value);
          // Skip undefined or empty values
          if (!value || value === 'undefined') return null;
          return `${attr.shortName}: ${value}`;
        })
        .filter(Boolean)
        .join(', ');

      const issuer = certificate.issuer.attributes
        .map((attr) => {
          const value = decodeAttributeValue(attr.value);
          if (!value || value === 'undefined') return null;
          return `${attr.shortName}: ${value}`;
        })
        .filter(Boolean)
        .join(', ');

      const locale = language === 'es' ? 'es-MX' : 'en-US';

      setCertInfo({
        subject,
        issuer,
        notBefore: notBefore.toLocaleString(locale),
        notAfter: notAfter.toLocaleString(locale),
        isValid,
        serialNumber: certificate.serialNumber
      });
    } catch (error) {
      console.error('Error parsing certificate:', error);
      setCertInfo(null);
    }
  };

  const validateCertificate = async () => {
    try {
      setLoading(true);
      setResult(null);

      // Validation
      if (!certFile) {
        setResult({
          success: false,
          message: `${t.errors.missingCert}\n${t.errors.missingCertDesc}`
        });
        return;
      }

      if (!keyFile) {
        setResult({
          success: false,
          message: `${t.errors.missingKey}\n${t.errors.missingKeyDesc}`
        });
        return;
      }

      if (!password) {
        setResult({
          success: false,
          message: `${t.errors.missingPassword}\n${t.errors.missingPasswordDesc}`
        });
        return;
      }

      // Store password in ref for cleanup
      passwordRef.current = password;

      // Read files
      const certData = await readFileAsText(certFile);
      const keyData = await readFileAsText(keyFile);

      // Parse certificate
      let certificate;
      try {
        certificate = forge.pki.certificateFromPem(certData);
      } catch (e) {
        throw new Error(t.errors.invalidCert);
      }

      // Parse private key (PKCS#8 encrypted format)
      let privateKey;
      try {
        // Try to decrypt the private key using PKCS#8 format
        const encryptedKey = forge.pki.encryptedPrivateKeyFromPem(keyData);
        const decryptedInfo = forge.pki.decryptPrivateKeyInfo(encryptedKey, password);
        privateKey = forge.pki.privateKeyFromAsn1(decryptedInfo);
      } catch (e) {
        // If PKCS#8 fails, try traditional RSA format
        try {
          privateKey = forge.pki.decryptRsaPrivateKey(keyData, password);
          if (!privateKey) {
            throw new Error('Decryption failed');
          }
        } catch (rsaError) {
          throw new Error(t.errors.invalidKey);
        }
      }

      // Verify the key matches the certificate
      const publicKeyFromCert = certificate.publicKey as forge.pki.rsa.PublicKey;
      const publicKeyFromPrivate = forge.pki.setRsaPublicKey(
        (privateKey as forge.pki.rsa.PrivateKey).n,
        (privateKey as forge.pki.rsa.PrivateKey).e
      );

      // Compare public keys
      const certPublicKeyPem = forge.pki.publicKeyToPem(publicKeyFromCert);
      const privatePublicKeyPem = forge.pki.publicKeyToPem(publicKeyFromPrivate);

      if (certPublicKeyPem !== privatePublicKeyPem) {
        setResult({
          success: false,
          message: t.errors.keyMismatch
        });
        return;
      }

      // Show SweetAlert success
      await Swal.fire({
        icon: 'success',
        title: t.alerts.keyMatch.title,
        text: t.alerts.keyMatch.text,
        confirmButtonText: t.alerts.keyMatch.confirmButton,
        confirmButtonColor: '#004494'
      });

      setResult({
        success: true,
        message: t.results.success
      });

    } catch (error) {
      setResult({
        success: false,
        message: `${t.errors.validationFailed}: ${(error as Error).message}`
      });
    } finally {
      setLoading(false);
      // Clear sensitive data
      secureCleanup();
    }
  };

  const convertToPEM = async () => {
    try {
      setConverting(true);
      setPemData(null);

      // Validation
      if (!certFile) {
        setResult({
          success: false,
          message: `${t.errors.missingCert}\n${t.errors.missingCertDesc}`
        });
        return;
      }

      if (!keyFile) {
        setResult({
          success: false,
          message: `${t.errors.missingKey}\n${t.errors.missingKeyDesc}`
        });
        return;
      }

      if (!password) {
        setResult({
          success: false,
          message: `${t.errors.missingPassword}\n${t.errors.missingPasswordDesc}`
        });
        return;
      }

      // Store password in ref for cleanup
      passwordRef.current = password;

      // Read files
      const certData = await readFileAsText(certFile);
      const keyData = await readFileAsText(keyFile);

      // Parse certificate to verify it's valid
      let certificate;
      try {
        certificate = forge.pki.certificateFromPem(certData);
      } catch (e) {
        throw new Error(t.errors.invalidCert);
      }

      // Decrypt private key
      let privateKey;
      try {
        const encryptedKey = forge.pki.encryptedPrivateKeyFromPem(keyData);
        const decryptedInfo = forge.pki.decryptPrivateKeyInfo(encryptedKey, password);
        privateKey = forge.pki.privateKeyFromAsn1(decryptedInfo);
      } catch (e) {
        try {
          privateKey = forge.pki.decryptRsaPrivateKey(keyData, password);
          if (!privateKey) {
            throw new Error('Decryption failed');
          }
        } catch (rsaError) {
          throw new Error(t.errors.invalidKey);
        }
      }

      // Convert private key to PEM format (unencrypted)
      const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

      // Combine certificate and private key into a single PEM file
      const combinedPem = `${certData.trim()}\n${privateKeyPem.trim()}\n`;

      setPemData(combinedPem);
      setResult({
        success: true,
        message: t.converter.success
      });

    } catch (error) {
      setResult({
        success: false,
        message: `${t.errors.validationFailed}: ${(error as Error).message}`
      });
    } finally {
      setConverting(false);
      secureCleanup();
    }
  };

  const downloadPEM = () => {
    if (!pemData) return;

    const blob = new Blob([pemData], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certificate.pem';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertFile(file);
      parseCertificateInfo(file);
    }
  };

  const handleKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setKeyFile(file);
  };

  return (
    <div className="validator-layout">
      {/* Instructions Side Panel */}
      <aside className={`instructions-panel ${showInstructions ? 'open' : 'closed'}`}>
        <button
          className="toggle-instructions"
          onClick={() => setShowInstructions(!showInstructions)}
          aria-label="Toggle instructions"
        >
          {showInstructions ? '◀' : '▶'}
        </button>

        {showInstructions && (
          <div className="instructions-content">
            <img
              src={theme === 'dark' ? '/logo-ac-white.svg' : '/logo-ac.svg'}
              alt="Logo AC"
              className="logo-ac"
            />
            <h3>{t.instructions.title}</h3>
            <ol>
              <li>{t.instructions.step1}</li>
              <li>{t.instructions.step2}</li>
              <li>{t.instructions.step3}</li>
              <li>{t.instructions.step4}</li>
            </ol>

            <div className="instruction-card">
              <h4>{t.instructions.validate.title}</h4>
              <p>{t.instructions.validate.desc}</p>
            </div>

            <div className="instruction-card">
              <h4>{t.instructions.convert.title}</h4>
              <p>{t.instructions.convert.desc}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="validator-container">
        <div className="validator-card">
          <div className="header">
            <h1>{t.title}</h1>
            <div className="controls">
              <button
                className="control-button theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                className="control-button language-toggle"
                onClick={toggleLanguage}
                aria-label="Toggle language"
              >
                {language === 'es' ? 'EN' : 'ES'}
              </button>
            </div>
          </div>

          <p className="subtitle">{t.subtitle}</p>

          <div className="security-notice">
            <strong>{t.securityNotice.title}</strong>
            <p>{t.securityNotice.description}</p>
          </div>

          {/* Certificate Info Display - Shown after cert is selected */}
          {certInfo && (
            <div className="cert-info-display">
              <h3>{t.certInfo.title}</h3>
              <div className="cert-info-content">
                <div className="info-row">
                  <strong>{t.results.subject}:</strong>
                  <span>{certInfo.subject}</span>
                </div>
                <div className="info-row">
                  <strong>{t.results.issuer}:</strong>
                  <span>{certInfo.issuer}</span>
                </div>
                <div className="info-row">
                  <strong>{t.results.serialNumber}:</strong>
                  <span>{certInfo.serialNumber}</span>
                </div>
                <div className="info-row">
                  <strong>{t.results.validFrom}:</strong>
                  <span>{certInfo.notBefore}</span>
                </div>
                <div className="info-row">
                  <strong>{t.results.validUntil}:</strong>
                  <span>{certInfo.notAfter}</span>
                </div>
                <div className="info-row">
                  <strong>{t.results.status}:</strong>
                  <span className={certInfo.isValid ? 'status-valid' : 'status-expired'}>
                    {certInfo.isValid ? t.results.currentlyValid : t.results.expired}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="certFile">{t.form.certFile}</label>
            <input
              type="file"
              id="certFile"
              accept=".cer,.crt,.pem"
              onChange={handleCertFileChange}
            />
            {certFile && <span className="file-name">📄 {certFile.name}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="keyFile">{t.form.keyFile}</label>
            <input
              type="file"
              id="keyFile"
              accept=".key,.pem"
              onChange={handleKeyFileChange}
            />
            {keyFile && <span className="file-name">🔑 {keyFile.name}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">{t.form.password}</label>
            <input
              type="password"
              id="password"
              placeholder={t.form.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="validate-button"
            onClick={validateCertificate}
            disabled={loading || converting}
          >
            {loading ? t.form.validating : t.form.validateButton}
          </button>

          <div className="converter-section">
            <h2>{t.converter.title}</h2>
            <p className="converter-description">{t.converter.description}</p>

            <button
              className="convert-button"
              onClick={convertToPEM}
              disabled={loading || converting}
            >
              {converting ? t.converter.converting : t.converter.convertButton}
            </button>

            {pemData && (
              <button
                className="download-button"
                onClick={downloadPEM}
              >
                📥 {t.converter.downloadButton}
              </button>
            )}
          </div>

          {(loading || converting) && <div className="loader"></div>}

          {result && !result.success && (
            <div className="result error">
              <div className="result-title">{result.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateValidator;
