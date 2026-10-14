# Raíces Criollas · Guía de dockerización

Este documento explica **qué hay que hacer a partir de ahora** para que cada
microservicio corra con Docker. Léelo completo antes de empezar y sigue el
checklist de tu servicio.

## 1. Archivo `.env`

Se les entrega un archivo `.env` (por privado, no está en el repositorio). Colócalo en la
**raíz del proyecto**, junto al `docker-compose.yaml`, y completa **solo tus credenciales
de base de datos**:

```dotenv
DB_USER=YOUR_USER             # ← pon tu usuario de Postgres
DB_PASSWORD=YOUR_PASSWORD     # ← pon tu contraseña de Postgres
JWT_SECRET=...                # ya viene completo, NO lo cambies
INTERNAL_SECRET=...           # ya viene completo, NO lo cambies
```

`JWT_SECRET` e `INTERNAL_SECRET` deben ser **iguales para todos**, porque los servicios
firman y validan con la misma clave. `DB_USER` y `DB_PASSWORD` son locales a tu máquina.

Con el `.env` en su sitio:

```bash
docker compose up --build
```

## 2. Estado actual

| Servicio | Estado |
|---|---|
| eureka | Dockerizado |
| gateway | Dockerizado |
| auth (con datos iniciales) | Dockerizado |
| menu | **Pendiente** |
| reservas | **Pendiente** |
| pedidos | **Pendiente** |
| payment | **Pendiente** |

El ejemplo a seguir es **auth**: copia su estructura (`raices-criollas-auth/Dockerfile`,
su `application.yml` y su bloque en `docker-compose.yaml`) y adáptala a tu servicio.

## 3. Qué debe hacer cada quien

### Para TODOS los servicios pendientes

- [ ] Crear el `Dockerfile` en la raíz de tu carpeta (copiar el de auth y ajustar el
      nombre del `.jar` y el puerto).
- [ ] Cambiar tu `application.yml` para leer variables de entorno (sección 4).
- [ ] Agregar tu servicio al `docker-compose.yaml` (sección 5).
- [ ] Si tu servicio usa base de datos, agregar su contenedor `postgres-<servicio>`.
- [ ] Probar con `docker compose up --build` y verificar que aparece registrado en
      http://localhost:8761.

### Servicios que además llevan datos iniciales

| Servicio | Datos que debe traer |
|---|---|
| **menu** | Categorías y platos (sus dos únicas tablas) |
| **reservas** | Mesas |

- [ ] Crear `dbInit/<servicio>_db.sql` con el `CREATE TABLE IF NOT EXISTS` de cada
      tabla **y después** los `INSERT`.
- [ ] En el `application.yml`, poner `ddl-auto: validate` (o `none`).
- [ ] Verificar que las columnas del SQL coinciden exactamente con las entidades JPA.
- [ ] Montar el script en el contenedor de Postgres (ver sección 5).

### Servicios sin datos iniciales

**pedidos** y **payment** (y cualquier otro): **no llevan script SQL**. Sus registros se
crean al hacer y pagar un pedido. Usar `ddl-auto: update`.

## 4. Variables de entorno en el `application.yml`

Nada de valores fijos a `localhost`. Usar variable con valor por defecto, para seguir
pudiendo correr en local:

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/mi_db}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:}
eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_URL:http://localhost:8761/eureka}
  instance:
    hostname: ${EUREKA_HOSTNAME:localhost}
```

Los nombres deben ser **exactamente** estos, iguales en todos los servicios:

| Variable | Uso |
|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | Base de datos |
| `EUREKA_URL`, `EUREKA_HOSTNAME` | Registro en Eureka |
| `JWT_SECRET`, `INTERNAL_SECRET` | Seguridad |
| `RABBITMQ_HOST`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD` | Menu y pedidos |

Los secretos **no llevan valor por defecto**.

## 5. Plantilla para el compose

Sustituye `<servicio>`, el puerto y el nombre de la base. Los valores de ejemplo salen del
servicio auth; no los copies a ciegas.

```yaml
  postgres-<servicio>:
    image: postgres:18
    container_name: raices-criollas-postgres-<servicio>
    restart: unless-stopped
    environment:
      POSTGRES_DB: <servicio>_db
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Define DB_PASSWORD en .env}
    volumes:
      - <servicio>_postgres_data:/var/lib/postgresql
      # Solo si el servicio lleva datos iniciales:
      - ./dbInit/<servicio>_db.sql:/docker-entrypoint-initdb.d/01-<servicio>.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 5s
      retries: 10

  <servicio>:
    build:
      context: ./raices-criollas-<servicio>
      dockerfile: Dockerfile
    container_name: raices-criollas-<servicio>
    restart: unless-stopped
    environment:
      DB_URL: jdbc:postgresql://postgres-<servicio>:5432/<servicio>_db
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      EUREKA_URL: http://eureka:8761/eureka
      EUREKA_HOSTNAME: raices-criollas-<servicio>
    depends_on:
      postgres-<servicio>:
        condition: service_healthy
      eureka:
        condition: service_started
```

Y al final del archivo, en `volumes:`, declarar `<servicio>_postgres_data:`.

Notas:
- **No publiques puertos** (`ports:`) de tu servicio ni de tu base de datos. Solo el
  gateway (8080) y Eureka (8761) se exponen. Si necesitas probar directo, añade el puerto
  temporalmente y no lo subas.
- Si usas RabbitMQ (menu y pedidos), el servicio depende también de `rabbitmq` con
  `condition: service_healthy`. Se agregará ese contenedor al compose.

## 6. Reglas del SQL de datos iniciales

- Postgres ejecuta los scripts de `/docker-entrypoint-initdb.d` **solo la primera vez**,
  con el volumen vacío. Si cambias el script, ejecuta `docker compose down -v`.
- Primero las tablas, después los `INSERT`.
- Contraseñas siempre como hash BCrypt, **nunca en texto plano**.
- `ON CONFLICT DO NOTHING` cuando se pueda.

## 7. Qué NO hacer

- No subir el archivo `.env` al repositorio (debe estar en el `.gitignore`).
- No dejar contraseñas, tokens ni claves reales en `application.yml` ni en el SQL.
- No usar `localhost` para hablar con otro servicio o con la base de datos dentro del compose:
  usar el nombre del servicio (`postgres-menu`, `eureka`, …).
- No publicar puertos internos.

## 8. Comandos útiles

```bash
docker compose up -d --build      # levantar en segundo plano
docker compose logs -f menu       # ver logs de un servicio
docker compose down               # apagar (conserva los datos)
docker compose down -v            # apagar y BORRAR datos (vuelve a correr los SQL)
```

## 9. Commits

Conventional Commits, en inglés, agrupados por microservicio:

```
feat(menu): add Dockerfile and externalize configuration through environment variables
feat(db): add menu database init script with seed categories and dishes
feat(docker): add menu service to docker-compose
```

## 10. Cuando termines

1. Ejecuta `docker compose down -v` y luego `docker compose up --build` desde cero.
2. Comprueba que tu servicio aparece en http://localhost:8761 y que, si lleva datos
   iniciales, estos existen.
3. Sube tu rama y avisa para integrarla.
