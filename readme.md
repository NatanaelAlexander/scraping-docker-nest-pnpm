# NestJS Scraper Test - SII Chile

Proyecto de prueba para hacer scraping del portal SII (Servicio de Impuestos Internos) de Chile usando:

- NestJS
- Node.js (LTS)
- PNPM
- Docker
- Chromium local en el contenedor API (navegación headless)

> Proyecto solo para pruebas y aprendizaje, no pensado para producción.

## 📋 Requisitos Previos

1. **Docker y Docker Compose** instalados en tu sistema
2. **Credenciales del SII** (RUT y contraseña)

## ⚙️ Configuración

### 1. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

### 2. Editar el archivo `.env`

Abre el archivo `.env` y configura tus credenciales:

```env
# Credenciales del SII
RUT_TRIBUTARIO=12345678-9
PASS_TRIBUTARIO=tu_contraseña_aquí
```

**Importante:**
- El RUT debe estar en formato `12345678-9` (con guión)

## 🚀 Levantar el proyecto

```bash
docker compose up --build
```

## 🛑 Detener el proyecto

```bash
docker compose down
```

## 📡 Acceso

- **API Base:** [http://localhost:3000](http://localhost:3000)
- **Documentación Swagger:** [http://localhost:3000/docs](http://localhost:3000/docs)

## 🔍 Uso del Scraper SII

### Health check de Chromium/Puppeteer

Para validar en runtime que Chromium está operativo:

```
GET http://localhost:3000/scraper/sii/health/chromium
```

Respuesta esperada (ok):

```json
{
  "success": true,
  "chromium": {
    "ok": true,
    "executablePath": "/usr/bin/chromium-browser",
    "timeoutMs": 90000
  }
}
```

### Opción 1: Usar las credenciales del `.env`

Si configuraste las credenciales en el archivo `.env`, simplemente accede a:

```
GET http://localhost:3000/scraper/sii/datos-personales
```

### Opción 2: Pasar credenciales como parámetros

Puedes probar con diferentes credenciales sin modificar el `.env`:

```
GET http://localhost:3000/scraper/sii/datos-personales?rut=12345678-9&password=MiPassword123
```

### Opción 3: Usar Swagger UI

1. Abre [http://localhost:3000/docs#/Scraper/ScraperController_obtenerDatosPersonalesCompletos](http://localhost:3000/docs#/Scraper/ScraperController_obtenerDatosPersonalesCompletos)
2. Haz click en "Try it out"
3. Ingresa el RUT y la contraseña del SII (opcional si ya están en el `.env`)
4. Haz click en "Execute"

## 📊 Datos Extraídos

El scraper extrae la siguiente información del portal Mi SII:

1. ✅ **Direcciones** - Direcciones vigentes del contribuyente
2. ✅ **Teléfonos y Correos electrónicos**
3. ✅ **Inicio de actividades y término de giro**
4. ✅ **Estado de cumplimiento de las obligaciones tributarias**
5. ✅ **Representantes legales**
6. ✅ **Socios y Capital**
7. ✅ **Actividades económicas**
8. ✅ **Sociedades a las que pertenece el contribuyente**
9. ✅ **Características del contribuyente**
10. ✅ **Apoderados de Grupos Empresariales**
11. ✅ **Documentos tributarios autorizados**
12. ✅ **Bienes Raíces**
13. ✅ **Oficina del SII para trámites presenciales**

## 🛠️ Tecnologías Utilizadas

- **NestJS** - Framework backend
- **Puppeteer + Chromium local** - Navegador headless para automatización
- **Cheerio** - Parser HTML para extracción de datos
- **Docker** - Contenedorización
- **Swagger** - Documentación de API

## 📝 Descripción

Este proyecto se usa únicamente para practicar scraping dentro de un backend con NestJS usando Docker. Implementa un scraper real del portal SII de Chile utilizando Puppeteer con Chromium local para simular un navegador real.

## ⚠️ Aviso Legal

Este proyecto es solo para fines educativos y de prueba. Asegúrate de cumplir con los términos de servicio del SII y las leyes aplicables sobre scraping web en tu jurisdicción.

## 🚀 Roadmap

Este proyecto está en desarrollo activo y se planea implementar las siguientes funcionalidades:

- **Formularios tributarios**
  - F29 (Declaración Mensual de Impuestos)
  - F22 (Declaración de Renta Anual)
- **Impuestos y retenciones**
- **Boletas electrónicas**
- **Facturas y documentos tributarios**
- Y más funcionalidades relacionadas con el SII

El proyecto seguirá creciendo para cubrir más aspectos de la automatización tributaria en Chile.