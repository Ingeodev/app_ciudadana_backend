# BACKEND DE MOVILIDAD CALI
Este backend ha sido generado desde cero para dar soporte a la Aplicación de Movilidad de Cali.

**Tabla de Contenidos**
- [BACKEND DE MOVILIDAD CALI](#backend-de-movilidad-cali)
  - [1. Herramientas](#1-herramientas)
  - [2. Arquitectura](#2-arquitectura)
    - [2.1. Formato de Respuesta](#21-formato-de-respuesta)
      - [Solicitud HTTP Exitosa](#solicitud-http-exitosa)
      - [Solicitud HTTP Fallida](#solicitud-http-fallida)
  - [3. Ejecución Local](#3-ejecución-local)
    - [3.1. Modo Monolito (Recomendado para Desarrollo Local)](#31-modo-monolito-recomendado-para-desarrollo-local)
    - [3.2. Modo Microservicios (Docker)](#32-modo-microservicios-docker)
  - [4. Microservicios](#4-microservicios)
    - [4.1. Microservicio de Usuarios](#41-microservicio-de-usuarios)
    - [4.2. Microservicio de Notificaciones](#42-microservicio-de-notificaciones)
    - [4.3. Microservicio de Terceros](#43-microservicio-de-terceros)
    - [4.4. Microservicio de Gestión de Archivos](#44-microservicio-de-gestión-de-archivos)
    - [4.5. Microservicio de Tráfico (Movilidad)](#45-microservicio-de-tráfico-movilidad)
    - [4.6. Microservicio de Administradores](#46-microservicio-de-administradores)
  - [5. Contribuidores](#5-contribuidores)
  - [6. Licencia](#6-license)

---

## 1. Herramientas

1. [Firebase](https://firebase.google.com/)
2. [Docker](https://www.docker.com/)
3. [Express](https://expressjs.com/)

**Postman**: [Enlace a la Documentación](http://postmanTest.com "Link de Documentación")

---

## 2. Arquitectura

### 2.1. Formato de Respuesta
#### Solicitud HTTP Exitosa
Para cualquier tipo de solicitud HTTP exitosa, nuestra API devuelve en la respuesta (en formato JSON) los mismos datos que recibe. Esto permite confirmar los datos procesados.

#### Solicitud HTTP Fallida
Cuando ocurre un error durante el procesamiento de cualquier solicitud HTTP, nuestra API responde con un objeto JSON que contiene los siguientes campos:
- `status`: El código de estado HTTP asociado con el problema.
- `code`: Un código de error específico de nuestra aplicación.
- `detail`: Una descripción detallada del problema ocurrido.

```json
{
    "status": number,
    "code": string,
    "detail": string
}
```

---

## 3. Ejecución Local

### 3.1. Modo Monolito (Recomendado para Desarrollo Local)
Recientemente se ha habilitado un modo monolito que ejecuta todos los servicios en un solo proceso. Esto simplifica el desarrollo y las pruebas locales.

1. Instalar dependencias:
   ```bash
   cd src
   npm install
   ```
2. Configurar el archivo `.env` y `src/config/account_service_key.json`.
3. Ejecutar el servidor:
   ```bash
   npm run backend
   ```
   El servidor correrá por defecto en el puerto **3001**.

### 3.2. Modo Microservicios (Docker)
Para construir las imágenes:
```bash
docker build -t cali-mobility-app .
# Para arquitecturas específicas
docker build --platform linux/amd64 -t cali-mobility-app .
```

Ejecutar las imágenes en tu entorno:
```bash
# Desde el directorio raíz
docker build --platform linux/amd64 -t app_mobility_users_ms -f src/microservices/users/Dockerfile .
docker build --platform linux/amd64 -t app_mobility_notifications_ms -f src/microservices/notifications/Dockerfile .
docker build --platform linux/amd64 -t app_mobility_third_parties_ms -f src/microservices/thirdParties/Dockerfile .
docker build --platform linux/amd64 -t app_mobility_file_management_ms -f src/microservices/fileManagement/Dockerfile .

# Luego ejecutarlos
docker run -d -p 3000:3000 app_mobility_users_ms
docker run -d -p 3001:3000 app_mobility_notifications_ms
docker run -d -p 3002:3000 app_mobility_third_parties_ms
docker run -d -p 3003:3000 app_mobility_file_management_ms
```

---

## 4. Microservicios

### 4.1. Microservicio de Usuarios
Este microservicio maneja los endpoints de [**Usuarios**](#4131-users) y [**Tipos de Documento**](#4132-document-types). Incluye una validación para asegurar que una latitud y longitud pertenecen al área del Municipio de Cali.

#### 4.1.1 Cloud Run en GCP
`https://users-cmiesjcqoq-ue.a.run.app`

#### 4.1.2 Cómo ejecutar localmente
```bash
cd src/microservices/users
node index.js
```

*(Nota: Debido a la extensión del documento original, para una lista completa de los cientos de endpoints y sus parámetros técnicos, por favor consulte el [README.md original](README.md)).*

---

## 5. Contribuidores
Desarrollado para la Alcaldía de Cali.

## 6. Licencia
Derechos reservados © 2024.
