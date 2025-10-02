export const translations = {
  es: {
    title: '🔐 Validador de Certificado y Llave',
    subtitle: 'Valide pares de certificados y llaves privadas - Procesamiento 100% del lado del cliente',
    securityNotice: {
      title: '🛡️ Aviso de Seguridad:',
      description: 'Todo el procesamiento ocurre en su navegador. Sus archivos y contraseña nunca salen de su dispositivo.'
    },
    form: {
      certFile: 'Archivo de Certificado (.cer, .crt, .pem)',
      keyFile: 'Archivo de Llave Privada (.key, .pem)',
      password: 'Contraseña de la Llave Privada',
      passwordPlaceholder: 'Ingrese la contraseña de la llave privada',
      validateButton: 'Validar Certificado y Llave',
      validating: 'Validando...'
    },
    errors: {
      missingCert: '❌ Falta el Certificado',
      missingCertDesc: 'Por favor seleccione un archivo de certificado.',
      missingKey: '❌ Falta la Llave',
      missingKeyDesc: 'Por favor seleccione un archivo de llave privada.',
      missingPassword: '❌ Falta la Contraseña',
      missingPasswordDesc: 'Por favor ingrese la contraseña de la llave privada.',
      invalidCert: 'Formato de certificado inválido. Por favor proporcione un certificado válido codificado en PEM.',
      invalidKey: 'Error al descifrar la llave privada. Por favor verifique su contraseña y el formato del archivo de llave.',
      keyMismatch: '❌ La llave privada no coincide con el certificado. No son un par válido.',
      validationFailed: '❌ Validación Fallida'
    },
    results: {
      success: '✅ ¡El certificado y la llave privada son un par válido!',
      subject: 'Sujeto',
      issuer: 'Emisor',
      serialNumber: 'Número de Serie',
      validFrom: 'Válido Desde',
      validUntil: 'Válido Hasta',
      status: 'Estado',
      currentlyValid: '✅ Actualmente Válido',
      expired: '⚠️ Expirado o Aún No Válido',
      validationSuccess: '✅ Validación Exitosa'
    },
    theme: {
      light: 'Claro',
      dark: 'Oscuro'
    },
    language: {
      spanish: 'Español',
      english: 'English'
    }
  },
  en: {
    title: '🔐 Certificate & Key Validator',
    subtitle: 'Validate certificate and private key pairs - 100% client-side processing',
    securityNotice: {
      title: '🛡️ Security Notice:',
      description: 'All processing happens in your browser. Your files and password never leave your device.'
    },
    form: {
      certFile: 'Certificate File (.cer, .crt, .pem)',
      keyFile: 'Private Key File (.key, .pem)',
      password: 'Private Key Password',
      passwordPlaceholder: 'Enter password for private key',
      validateButton: 'Validate Certificate & Key',
      validating: 'Validating...'
    },
    errors: {
      missingCert: '❌ Missing Certificate',
      missingCertDesc: 'Please select a certificate file.',
      missingKey: '❌ Missing Key',
      missingKeyDesc: 'Please select a private key file.',
      missingPassword: '❌ Missing Password',
      missingPasswordDesc: 'Please enter the private key password.',
      invalidCert: 'Invalid certificate format. Please provide a valid PEM-encoded certificate.',
      invalidKey: 'Failed to decrypt private key. Please check your password and key file format.',
      keyMismatch: '❌ The private key does not match the certificate. They are not a valid pair.',
      validationFailed: '❌ Validation Failed'
    },
    results: {
      success: '✅ Certificate and private key are a valid pair!',
      subject: 'Subject',
      issuer: 'Issuer',
      serialNumber: 'Serial Number',
      validFrom: 'Valid From',
      validUntil: 'Valid Until',
      status: 'Status',
      currentlyValid: '✅ Currently Valid',
      expired: '⚠️ Expired or Not Yet Valid',
      validationSuccess: '✅ Validation Successful'
    },
    theme: {
      light: 'Light',
      dark: 'Dark'
    },
    language: {
      spanish: 'Español',
      english: 'English'
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.es;
