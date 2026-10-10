# Guía de Instalación y Configuración de Base de Datos - `reservas_db`

Este documento detalla el procedimiento paso a paso para configurar la base de datos PostgreSQL independiente del microservicio **`raices-criollas-reservas`** utilizando **pgAdmin 4** o la consola de comandos `psql`.

---

## 1. Arquitectura de Datos y Principio de Independencia

El proyecto Raíces Criollas aplica el patrón **Database per Service**:
* `auth_db`: Gestión de credenciales, roles y usuarios (`raices-criollas-auth`).
* `menu_db`: Categorías y platos (`raices-criollas-menu`).
* `reservas_db`: Catálogo de mesas y gestión de reservas (`raices-criollas-reservas`).

> [!IMPORTANT]
> **NO mezclar bases de datos ni tablas:**
> * La tabla `reservas` hace referencia al comensal mediante la columna `cliente_id` (tipo `BIGINT`), cuyo valor proviene del claim `sub` del token JWT validado en cada petición.
> * **No se declara ninguna clave foránea (`FOREIGN KEY`) hacia `auth_db`**, garantizando la total autonomía y escalabilidad del microservicio.

---

## 2. Mapa de Scripts y Contexto de Conexión

| Archivo | Base de Datos en la que debe ejecutarse | Propósito |
| :--- | :--- | :--- |
| `01_crear_base_datos.sql` | **`postgres`** (o base de mantenimiento) | Crea la base de datos `reservas_db` en el servidor local. |
| `02_esquema_reservas.sql` | **`reservas_db`** | Crea las tablas `mesas` y `reservas`, restricciones, checks e índices. |
| `03_datos_prueba_reservas.sql` | **`reservas_db`** (Opcional) | Carga 10 mesas iniciales con diferentes capacidades y ubicaciones. |

---

## 3. Instrucciones Paso a Paso en pgAdmin 4

### Paso 1: Crear la Base de Datos (`reservas_db`)
1. Abra **pgAdmin 4** e inicie sesión en su servidor local (ej. *PostgreSQL 16/17/18* en `localhost:5432`).
2. En el árbol de navegación izquierdo, expanda **Servers** > **PostgreSQL** > **Databases**.
3. Haga clic derecho sobre la base de datos por defecto **`postgres`** y seleccione **Query Tool**.
4. Abra o copie el contenido de `01_crear_base_datos.sql`:
   ```sql
   CREATE DATABASE reservas_db WITH OWNER = postgres ENCODING = 'UTF8';
   ```
5. Presione **F5** (o el botón de *Execute/Play*).
6. Haga clic derecho sobre **Databases** en el árbol izquierdo y seleccione **Refresh**. Ahora observará `reservas_db` en el listado.

> [!NOTE]
> La creación de la base de datos se realiza **una sola vez**. Si `reservas_db` ya existe en su servidor, omita este paso y pase directamente al Paso 2.

---

### Paso 2: Conectarse a `reservas_db` y Ejecutar el Esquema
1. En el árbol izquierdo de pgAdmin, busque y haga clic derecho sobre **`reservas_db`**.
2. Seleccione **Query Tool**.
3. **Verificación visual crítica:** Asegúrese de que la pestaña de consulta indique en su barra de título:
   `PostgreSQL ... / reservas_db @ postgres` (o su usuario configurado).
4. Abra el archivo `02_esquema_reservas.sql` o copie y pegue su contenido en el editor.
5. Presione **F5** para ejecutar.
6. En la pestaña *Messages* verá la confirmación:
   `Query returned successfully in ... msec.`

---

### Paso 3: (Opcional) Cargar Datos de Prueba de Mesas
1. Manteniendo abierta la ventana de Query Tool conectada a **`reservas_db`**:
2. Abra el archivo `03_datos_prueba_reservas.sql` o pegue su contenido.
3. Presione **F5**.
4. Este script insertará 9 mesas activas con capacidades de 2, 4, 6, 8 y 10 personas en diversas zonas (Salón Principal, Terraza, Balcón, VIP) y 1 mesa inactiva (`M-10`) diseñada para verificar que el sistema rechace reservas en mesas fuera de servicio.

---

### Paso 4: Verificación del Esquema en pgAdmin
Para comprobar que los objetos fueron creados correctamente, ejecute la siguiente consulta en el Query Tool de `reservas_db`:

```sql
-- Verificar existencia de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('mesas', 'reservas');

-- Verificar registros de mesas
SELECT id, numero_mesa, capacidad, ubicacion, activo FROM mesas;
```

Debe obtener las 2 tablas creadas y los registros de mesas cargados.

---

## 4. Configuración del Microservicio en `application.yml`

El archivo de configuración de producción local (`src/main/resources/application.yml`) está definido con variables de entorno y valores de respaldo:

```yaml
server:
  port: 8083

spring:
  application:
    name: raices-criollas-reservas
  datasource:
    url: "${DB_URL:jdbc:postgresql://localhost:5432/reservas_db}"
    username: "${DB_USER:postgres}"
    password: "${DB_PASSWORD:YOUR_PASSWORD}"
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        "[format_sql]": true
```

### Comportamiento de Hibernate (`ddl-auto: update`):
* El valor `update` valida las entidades JPA frente al esquema existente en PostgreSQL y agrega columnas nuevas si detecta cambios de entidad en código.
* Al haber ejecutado previamente el script `02_esquema_reservas.sql`, Hibernate respetará los tipos, nombres de columnas, claves primarias e índices ya existentes sin generar colisiones ni recrear tablas.

---

## 5. Arranque del Microservicio en Windows

Antes de iniciar el microservicio, establezca las variables de entorno en su terminal:

### En PowerShell:
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/reservas_db"
$env:DB_USER="postgres"
$env:DB_PASSWORD="tu_password_de_postgresql"
$env:JWT_SECRET="dGhpc2lzYXZlcnlzZWNyZXRrZXlmb3J0ZXN0aW5ncHVycG9zZXMxMjM0NTY3ODk="
$env:EUREKA_URL="http://localhost:8761/eureka"

# Ejecutar el servicio
cd "c:\Users\User\Desktop\CIBERTEC\DSWII - 6to CICLO\raices-criollas-backend-dswii\raices-criollas-reservas"
.\mvnw.cmd spring-boot:run
```

### En CMD (Símbolo del sistema):
```cmd
set DB_URL=jdbc:postgresql://localhost:5432/reservas_db
set DB_USER=postgres
set DB_PASSWORD=tu_password_de_postgresql
set JWT_SECRET=dGhpc2lzYXZlcnlzZWNyZXRrZXlmb3J0ZXN0aW5ncHVycG9zZXMxMjM0NTY3ODk=
set EUREKA_URL=http://localhost:8761/eureka

cd "c:\Users\User\Desktop\CIBERTEC\DSWII - 6to CICLO\raices-criollas-backend-dswii\raices-criollas-reservas"
mvnw.cmd spring-boot:run
```

---

## 6. Diagnóstico y Solución de Problemas Frecuentes

### Error 1: `Connection to localhost:5432 refused`
* **Causa:** El servicio PostgreSQL de Windows está detenido.
* **Solución:** Abra `Servicios` en Windows (`services.msc`), busque `postgresql-x64-<version>` y haga clic en **Iniciar**.

### Error 2: `FATAL: database "reservas_db" does not exist`
* **Causa:** No se ejecutó el script `01_crear_base_datos.sql` o se escribió un nombre incorrecto.
* **Solución:** Ejecute el script `01` conectado a la base `postgres` para crear `reservas_db`.

### Error 3: `FATAL: password authentication failed for user "postgres"`
* **Causa:** La contraseña en `$env:DB_PASSWORD` no coincide con la configurada en PostgreSQL.
* **Solución:** Verifique la contraseña de su superusuario PostgreSQL y defínala en la variable de entorno.

### Error 4: `relation "mesas" does not exist` al hacer SELECT
* **Causa:** El script `02_esquema_reservas.sql` se ejecutó por error conectado a `postgres` en lugar de `reservas_db`.
* **Solución:** Abra el Query Tool asegurándose de estar conectado a `reservas_db` y vuelva a ejecutar el script `02`.
