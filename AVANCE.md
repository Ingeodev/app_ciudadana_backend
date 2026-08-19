# INFORME TÉCNICO DE AVANCE Y MODERNIZACIÓN ESTRUCTURAL
**PROYECTO:** Plataforma de Backend - Aplicación Móvil de Movilidad Cali
**FECHA:** 12 de febrero de 2026
**DESTINATARIO:** Secretaría de Movilidad de Cali / Interventoría

---

## 1. RESUMEN EJECUTIVO
El presente informe detalla las actividades de auditoría, estabilización y modernización realizadas sobre el núcleo tecnológico de la Aplicación Ciudadana de Movilidad. Se ha logrado la transición exitosa de un entorno de microservicios disperso hacia un ecosistema de desarrollo controlado y eficiente, sentando las bases para una infraestructura escalable y costo-efectiva.

---

## 2. ANÁLISIS TÉCNICO DE LA APLICACIÓN ACTUAL

### 2.1 Auditoría de Infraestructura Heredada
La arquitectura original del sistema se fundamenta en un modelo de microservicios de alta dispersión sobre la plataforma **Google Cloud Platform (GCP)**. Este modelo, aunque escalable, presentaba una complejidad operativa y de costos elevada para la fase actual.

*   **Servicios de Cómputo**: Despliegue distribuido en múltiples contenedores via Cloud Run (Users, Notifications, Admin, ThirdParties, Traffic, FileManagement).
*   **Gestión de Datos**: Instancia de PostgreSQL persistente con alta dependencia de extensiones espaciales (**PostGIS**) para el motor de georreferenciación y **Unaccent** para la normalización de búsquedas.
*   **Servicios de Terceros e Integraciones**:
    *   **Ecosistema Firebase**: Centralización de Autenticación (Auth) y Notificaciones Push (FCM).
    *   **Integración de Mensajería (Sigma Móvil)**: Canal crítico para la difusión de alertas de emergencia y seguridad vial mediante SMS.
    *   **File Management**: Sistema de persistencia para la gestión documental de reportes ciudadanos y evidencias fotográficas.

### 2.2 Estructura Modular y Funcionalidades
Se han auditado y validado los siguientes módulos core:

| Módulo | Descripción Técnica y Funcional |
| :--- | :--- |
| **Microservicio de Usuarios** | Gestiona el ciclo de vida del ciudadano (Registro, Firma de Términos, Verificación DANE). Incluye lógica geoespacial para validar la ubicación del usuario dentro de los límites municipales. |
| **Gestión Administrativa** | Implementa un sistema de Control de Acceso Basado en Roles (RBAC) mediante Custom Claims en Firebase, permitiendo una administración centralizada y segura. |
| **Notificaciones y Alertas** | Orquestador de comunicaciones multicanal (Push, SMS, In-App) para informar cierres viales, accidentes y noticias de movilidad. |
| **Servicios de Terceros** | Catálogo dinámico de empresas de transporte, turismo y servicios públicos, integrado con motores de búsqueda por cercanía. |
| **Módulo de Tráfico** | Procesamiento de eventos viales en tiempo real, permitiendo la visualización de capas de información sobre el estado de la red vial de la ciudad. |

---

## 3. CREACIÓN Y ESTABILIZACIÓN DEL ENTORNO DE DESARROLLO

Para garantizar la continuidad de las mejoras sin comprometer los servicios de producción, se ha implementado un entorno de desarrollo local parametrizado y autónomo.

### 3.1 Tecnologías de Soporte
*   **Autenticación**: Migración de la lógica de identidad a una instancia de control personal en **Firebase**, permitiendo pruebas rigurosas de roles sin afectar la base de usuarios real.
*   **Persistencia de Datos**: Implementación de una base de datos PostgreSQL hospedada en **Supabase**, garantizando total compatibilidad con las funciones espaciales y de auditoría del sistema original.

### 3.2 Taxonomía Completa de Entidades de Base de Datos
Se ha realizado el despliegue, verificación y mapeo de la totalidad de las entidades que componen el sistema. A continuación se presenta el inventario exhaustivo de las **36 tablas** integradas:

| Categoría Funcional | Entidades (Tablas) Registradas |
| :--- | :--- |
| **Autenticación y Gobernanza** | `Roles`, `Users`, `UserApiKeys`, `DocumentTypes`, `BicyclesTermsConditions` |
| **Estructura Administrativa** | `Dependencies`, `AdminNotifications`, `MobileServices`, `AttentionLines`, `SocialNetworkTypes`, `SocialNetworks` |
| **Seguridad y Atención** | `Securities`, `SecurityCategories`, `SecurityAttentionPoints`, `GenderCategories`, `GenderAttentionLines`, `GenderAttentionPoints` |
| **Reportes y Alertas** | `Reports`, `ReportStatuses`, `ReportConfigurations`, `Alerts`, `Advertisements`, `TaxiComplaints` |
| **Infraestructura y Territorio** | `Cities`, `RoadStates`, `TrafficNotifications` |
| **Servicios de Terceros y Turismo** | `ThirdPartyCompanies`, `ThirdPartyCategories`, `ThirdPartyServices`, `TourismCompanies`, `TourismCategories`, `TourismServices` |
| **Transporte y Logística** | `TransportCompanies`, `TransportRoutes`, `RouteTimetables`, `RouteTimetableHourTariffs` |

**Hito Alcanzado:** Se desarrolló un script de automatización (`seedAdmin.js`) que realiza la creación sincronizada de roles de Super Administrador, usuarios en Firebase y registros en base de datos local de manera atómica, asegurando la integridad referencial entre todas las entidades listadas.

---

## 4. PROPUESTA DE AJUSTE A LA INFRAESTRUCTURA (ADOPCIÓN EXPONENCIAL)

La propuesta técnica sugerida se basa en el principio de **"Adopción Exponencial de Infraestructura"**, la cual busca la eficiencia presupuestal y técnica mediante los siguientes pilares:

### 4.1 Consolidación en Imagen Unificada (Fase 1)
Se propone prescindir del despliegue fragmentado en Google Cloud Run. En su lugar, se implementará una **Instancia de Máquina Virtual (VM) de alto rendimiento** donde residirá el servidor bajo una imagen de contenedor única (Monolito Consolidado).
*   **Beneficio**: Reducción inmediata de la latencia de red interna, simplificación de la gestión de logs y ahorro significativo en costos de infraestructura en la nube.

### 4.2 Escalabilidad Modular y API Gateway (Fase 2)
A medida que se monitoreen y detecten servicios con alta demanda de recursos, el sistema permitirá separar esos módulos específicos hacia contenedores dedicados de manera quirúrgica.
*   **API Gateway**: Se implementará un componente de orquestación frontal (API Gateway) que actuará como punto único de entrada. Esto garantiza que las aplicaciones móviles o web no necesiten cambios de configuración cuando el backend evolucione de monolito a microservicios parciales.

### 4.3 Ventajas Estratégicas
*   **Agilidad**: Mayor velocidad de despliegue y recuperación ante fallos.
*   **Desacoplamiento**: El cliente nunca interactúa directamente con los servidores internos, aumentando la seguridad y permitiendo cambios estructurales transparentes.
*   **Economía**: Inversión proporcional al uso real de cada componente del sistema.

---
**Miguel Ramirez**
Consultor de Desarrollo Backend
Ingeodev
