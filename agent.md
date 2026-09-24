# Contexto
Estas en un proyecto de servidor con express, el cual opera como el corazon central de un sistema para la ciudadania. Esta api es usada por un panel de control, una app movil ios y otra android y una aplicacion web. 

Los proyectos de la app web y el panel de control se encuentran en estas rutas de mi sistema de archivos asi:

- **App web:** /mnt/INGEODEV_PRODUCTOS/app_ciudadana_web_users
- **Panel de control:**/mnt/INGEODEV_PRODUCTOS/secretaria-movilidad/web/web-frontend


# REGLA DE ORO:

**Cada que realices un cambio en el comportamiento de esta api, deberás realizar los ajustes en las dos aplicaciones de app web y de panel de control para garantizar su compatibilidad en todo momento.**

**NOTA**

En caso que requieras actualizar el esquema de la base de datos, me indicas mostrandome los cambios y su fundamento y cuando yo los apruebe los puedes hacer. os cambios solo deben corresponder a creaciones y no actualizaciones o eliminaciones de tablas existentes. Las credenciales de la base de datos son 

DB_HOST=34.24.93.52
DB_PORT=5432
DB_NAME=app_ciudadana
DB_USER=app_ciudadana
DB_PASSWORD=pF^@yopq;2Y[%9(3
