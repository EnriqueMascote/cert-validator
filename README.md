# Validador de Certificados y Llaves - Gobierno de Chihuahua

Una aplicación web segura del lado del cliente, construida con React y TypeScript para validar pares de certificados (.cer) y llaves privadas (.key).

## 🔒 Características de Seguridad

- **Procesamiento 100% del Lado del Cliente**: Toda la validación ocurre en su navegador - ningún dato es enviado a un servidor
- **Gestión Segura de Memoria**: Las contraseñas y datos sensibles se eliminan de la memoria después de su uso
- **Sin Persistencia de Datos**: Los archivos y contraseñas nunca se almacenan o registran
- **Soporte PKCS#8**: Maneja llaves privadas cifradas en formato PKCS#8

## 🎨 Características de la Interfaz

- **Tema Claro/Oscuro**: Cambia entre modo claro y oscuro según tu preferencia
- **Multilingüe**: Español (México) por defecto con opción a cambiar a Inglés
- **Paleta de Colores Oficial**: Diseño basado en los colores corporativos del Gobierno de Chihuahua (#004494)
- **Soporte UTF-8**: Manejo correcto de caracteres especiales y acentos (Áá Éé Íí Óó Úú)

## 🚀 Inicio Rápido

### Modo Desarrollo

```bash
cd cert-validator-app
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build de Producción

```bash
npm run build
npm run preview
```

## 📋 Cómo Usar

1. **Seleccionar Archivo de Certificado**: Elija su archivo `.cer`, `.crt`, o `.pem`
2. **Seleccionar Archivo de Llave Privada**: Elija su archivo `.key` o `.pem`
3. **Ingresar Contraseña**: Escriba la contraseña de su llave privada cifrada
4. **Validar**: Haga clic en el botón validar para verificar si el certificado y la llave coinciden

## ✅ Qué Valida

- El certificado y la llave privada son un par válido
- Período de validez del certificado (fechas de inicio y expiración)
- Información del sujeto y emisor del certificado
- Número de serie del certificado
- Estado de validez actual

## 🔧 Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** para desarrollo rápido y construcción
- **node-forge** para operaciones criptográficas
- **CSS puro** para estilos con variables CSS (temas)

## 📝 Formatos Soportados

### Certificados
- `.cer` (codificación DER o PEM)
- `.crt` (codificación PEM)
- `.pem` (codificación PEM)

### Llaves Privadas
- `.key` (PKCS#8 cifrado o formato RSA tradicional)
- `.pem` (formato PEM cifrado)

## 🎨 Paleta de Colores

### Tema Claro
- **Color Primario**: #004494 (Azul Gobierno de Chihuahua)
- **Color Primario Oscuro**: #003171
- **Fondo**: #ffffff
- **Texto**: #1a1a1a

### Tema Oscuro
- **Color Primario**: #5a8fd4
- **Fondo**: #1a1a1a
- **Texto**: #e8e8e8

## 🛡️ Privacidad y Seguridad

Esta aplicación está diseñada con seguridad y privacidad como prioridades principales:

- No se realizan solicitudes de red
- Todas las operaciones criptográficas ocurren en el navegador
- La memoria se limpia de forma segura después de la validación
- Sin analíticas ni rastreo
- Código abierto y auditable

## 🌐 Internacionalización

- **Idioma por defecto**: Español (México)
- **Idiomas soportados**: Español, Inglés
- **Formato de fechas**: Localizado según el idioma seleccionado (es-MX / en-US)
- **Soporte completo de caracteres especiales**: Áá Éé Íí Óó Úú Ññ

## 📄 Licencia

Este proyecto es de código abierto y está disponible para su uso.

---

**Gobierno del Estado de Chihuahua**
