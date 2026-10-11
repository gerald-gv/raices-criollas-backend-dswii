# Raíces Criollas — Microservicio de Pedidos

Microservicio de **carrito de compras y registro de pedidos** para el proyecto grupal **Raíces Criollas**.

**Estado:** avance funcional de integración local (MVP académico). Se comprobó manualmente en Bruno el registro de usuario en Auth, autenticación JWT, consulta del carrito, incorporación de un plato mediante Menú, confirmación de un pedido y consulta posterior. Todavía hay pendientes de seguridad e integración antes de incorporar a `main` o desplegar.

## 1. Responsabilidad y tecnologías

Pedidos es un proyecto Spring Boot **independiente** de Auth, Menú, Eureka y Gateway. Gestiona el carrito por cliente, sus ítems y los pedidos confirmados. **No administra los platos ni los usuarios:** consulta los platos al microservicio Menú y acepta tokens JWT emitidos por Auth.

- Java 21, Spring Boot 4.1.1, Maven Wrapper.
- Spring Web MVC, Spring Data JPA/Hibernate y PostgreSQL.
- Spring Cloud OpenFeign para comunicación HTTP con Menú.
- Eureka Client para descubrimiento de servicios.
- Spring Security OAuth2 Resource Server para validar JWT HS256.
- Bean Validation y manejo centralizado de errores.

Puerto local de Pedidos: **8083**. Base de datos local: **`pedidos_db`**.

## 2. Cómo se comunica con el resto del sistema

```text
Bruno / consumidor HTTP
        |
        | Authorization: Bearer <JWT>
        v
  PedidosController (/pedidos/**)
        |
        v
    PedidosService --------> PlatoClient (Feign)
        |                           |
        |                           v
        |                   Eureka: raices-criollas-menu
        |                           |
        |                    GET /platos/{id}
        v
 CarritoRepository / PedidoRepository
        |
        v
 PostgreSQL: pedidos_db
```

**Auth** emite el JWT. **Pedidos** verifica su firma HS256 con una clave compartida `JWT_SECRET`, codificada en Base64. Las solicitudes a Pedidos requieren token válido. **Eureka** permite que Feign encuentre Menú por nombre (`raices-criollas-menu`) en lugar de usar una IP fija.

**Gateway:** este módulo funciona directamente en el puerto 8083. En la versión revisada, la ruta de Gateway para Pedidos **todavía debe coordinarse e incorporarse** (por ejemplo, bajo `/api/pedidos/**` con el prefijo y los filtros acordados por el equipo). No afirmar que ya funciona por Gateway sin probarla.

## 3. Modelo de datos y relaciones

| Entidad | Tabla | Función |
| --- | --- | --- |
| `Carrito` | `carritos` | Carrito de un cliente (`clienteId` único). |
| `ItemCarrito` | `items_carrito` | Plato (`platoId`) y cantidad dentro del carrito. |
| `Pedido` | `pedidos` | Cabecera: cliente, fecha, estado y total. |
| `DetallePedido` | `detalles_pedido` | Líneas del pedido con nombre, precio, cantidad y subtotal históricos. |

- **Carrito 1:N ItemCarrito**, con `@OneToMany`/`@ManyToOne`, `cascade = ALL` y `orphanRemoval = true`.
- **Pedido 1:N DetallePedido**, también con cascada y eliminación de huérfanos.
- `platoId` y `clienteId` son **identificadores externos**, no claves foráneas JPA hacia las bases de Menú/Auth: cada microservicio administra su propia persistencia.
- En el carrito se guarda **platoId + cantidad**; al confirmar se consultan de nuevo los datos de Menú y se registran **nombre, precio unitario y subtotal** en el detalle del pedido. De ese modo, un cambio posterior de precio en Menú no cambia un pedido histórico.

La configuración local usa `spring.jpa.hibernate.ddl-auto: update` para crear/actualizar tablas de desarrollo. **No se debe usar `update` como estrategia de migración en producción**.

## 4. Lógica implementada

1. **Ver carrito:** busca por `clienteId` en `CarritoRepository`; si no existe, devuelve un carrito vacío sin crearlo en BD.
2. **Agregar plato:** valida `clienteId`, `platoId` y `cantidad`; Feign consulta `GET /platos/{id}`. Solo acepta un plato existente, disponible y con precio positivo. Si ya está en el carrito, **suma** la cantidad; si no, crea un nuevo ítem. Guarda el carrito.
3. **Quitar plato:** elimina un ítem del carrito por `platoId` usando `orphanRemoval`; si el carrito o plato no existe, informa el error.
4. **Confirmar carrito:** exige que contenga ítems; vuelve a consultar cada plato en Menú, calcula `subtotal = precio × cantidad` y acumula el total con `BigDecimal`; crea `Pedido` con estado inicial `REGISTRADO` y sus detalles; **elimina el carrito** después de guardar el pedido. El proceso local de BD es `@Transactional`.
5. **Consultar pedido:** busca por ID en `PedidoRepository` y devuelve los detalles.
6. **Listar pedidos de cliente:** devuelve los pedidos ordenados por fecha descendente.

**Nota importante:** una transacción local no convierte la comunicación Feign entre microservicios en una transacción distribuida. Si falla Menú durante la confirmación, la operación puede fallar y debe tratarse apropiadamente.

## 5. Requisitos y variables de entorno

Antes de arrancar, disponer de **Java 21**, PostgreSQL y los servicios Eureka, Auth y Menú. Crear la BD de Pedidos desde pgAdmin o conectado a la base `postgres`:

```sql
CREATE DATABASE pedidos_db;
```

Configurar las variables en **STS → Run Configurations → Spring Boot App → Raices Criollas - Pedidos → Environment → Add**:

| Variable | Uso | Ejemplo de desarrollo |
| --- | --- | --- |
| `DB_URL` | URL JDBC; opcional si se usa el valor por defecto | `jdbc:postgresql://localhost:5432/pedidos_db` |
| `DB_USER` | Usuario PostgreSQL; por defecto `postgres` | `postgres` |
| `DB_PASSWORD` | **Obligatoria**; contraseña local PostgreSQL | No escribir en Git |
| `JWT_SECRET` | **Obligatoria**; secreto Base64 HS256 compartido con Auth (y Menú si valida esos tokens) | No escribir en Git |
| `EUREKA_HOSTNAME` | Host de registro; por defecto `localhost` | `localhost` |
| `EUREKA_URL` | Dirección Eureka; valor por defecto | `http://localhost:8761/eureka` |

Las variables configuradas en STS son **por configuración de ejecución**; no se transfieren automáticamente entre proyectos. Configurar Auth y Menú de forma independiente, según sus `application.yml`, con sus propias credenciales y bases (`auth_db`, `menu_db`). Si todos verifican JWT HS256, usar la **misma clave de desarrollo** entre emisores y validadores. Se puede generar una clave local con `openssl rand -base64 32` y compartirla por un canal privado, **nunca por commit, README, captura o chat público**.

### Particularidades de los otros servicios durante nuestras pruebas

- Auth necesitó un registro `ROLE_CLIENTE` en su tabla `roles` para poder registrar un usuario. Al crear una BD de Auth nueva, el equipo debe definir datos iniciales/seed versionados; el servicio actual no los creó automáticamente en nuestra prueba.
- Menú tenía `ddl-auto: validate`: exige que sus tablas ya existan. Para una BD local vacía se crearon las tablas temporalmente con `update` y luego se restauró el archivo original de Menú antes del commit. **No incluir ese cambio temporal en la rama de Pedidos**.
- Debe haber al menos **un plato disponible en Menú** para probar `agregar` y `confirmar`; el identificador del plato debe obtenerse de los datos reales de Menú.

## 6. Ejecutar y verificar

Orden sugerido en STS (mantener todos ejecutándose):

1. PostgreSQL; confirmar `auth_db`, `menu_db` y `pedidos_db` según la configuración de cada servicio.
2. **Eureka**: puerto 8761, panel en `http://localhost:8761`.
3. **Auth**: puerto 8081; configurar sus variables.
4. **Menú**: puerto 8082; requiere esquema de BD y datos de platos para pruebas.
5. **Pedidos**: puerto 8083; configurar `DB_PASSWORD` y `JWT_SECRET`.
6. **Gateway**: puerto 8080; su arranque no implica que tenga la ruta de Pedidos.

Comprobar en el panel de Eureka que `RAICES-CRIOLLAS-AUTH`, `RAICES-CRIOLLAS-MENU` y `RAICES-CRIOLLAS-PEDIDOS` aparezcan `UP`. `UP` **no sustituye** probar sus endpoints.

Compilación con Maven Wrapper (en la carpeta `raices-criollas-pedidos`):

```bash
./mvnw clean verify     # Git Bash en Windows
```

O en CMD: `mvnw.cmd clean verify`. Este comando compila y ejecuta los tests disponibles; **no equivale a una prueba integral** de Auth–Menú–Pedidos.

## 7. Endpoints y ejemplos para Bruno

**Por ahora probar directamente en** `http://localhost:8083`. En **Auth → Bearer Token** pegar el `accessToken` emitido por `POST http://localhost:8081/api/auth/login` (sin comillas ni prefijo `Bearer`). Para registrar usuario en Auth: `POST http://localhost:8081/api/auth/register`, sin autenticación y con el cuerpo requerido por `RegisterRequest` de Auth.

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/pedidos/carrito/{clienteId}` | Ver carrito (vacío si no existe). |
| POST | `/pedidos/carrito/{clienteId}/items` | Agregar o sumar cantidad. |
| DELETE | `/pedidos/carrito/{clienteId}/items/{platoId}` | Retirar plato del carrito. |
| POST | `/pedidos/carrito/{clienteId}/confirmar` | Generar pedido; devuelve `201 Created`. |
| GET | `/pedidos/{id}` | Consultar pedido. |
| GET | `/pedidos/cliente/{clienteId}` | Listar pedidos de un cliente. |

**Agregar ítems** — `POST http://localhost:8083/pedidos/carrito/1/items`, Body JSON:

```json
{
  "platoId": 1,
  "cantidad": 2
}
```

El `platoId` debe existir y estar disponible en Menú. `cantidad` debe ser al menos 1. Para comprobar la disponibilidad en Menú se utilizó `GET http://localhost:8082/platos/disponibles` (con JWT donde corresponda).

**Confirmar** — `POST http://localhost:8083/pedidos/carrito/1/confirmar`, con Bearer Token y **sin Body**. Devuelve estado `REGISTRADO`, detalles y total.

**Consultar** — `GET http://localhost:8083/pedidos/1`, con Bearer Token.

Formato general de respuesta:

```json
{
  "success": true,
  "mensaje": "Pedido registrado",
  "data": { "id": 1, "clienteId": 1, "estado": "REGISTRADO", "total": 70.00, "detalles": [] }
}
```

El ejemplo solo ilustra la estructura (el arreglo `detalles` real contendrá los ítems y también se devuelve `fecha`). Los IDs y valores dependen de los datos de prueba.

### Pruebas manuales realizadas

- Registro de usuario en Auth: **201**, tras crear el rol faltante `ROLE_CLIENTE`.
- Acceso autenticado a carrito: **200**.
- Menú: lista inicial vacía; se registró un plato disponible llamado *Lomo saltado*, a **S/ 35**.
- Agregar **2 unidades** por Feign: **200**.
- Confirmar: **201**, pedido con total **S/ 70**, estado `REGISTRADO`.
- Consultar pedido confirmado: **200**.

Estas son **pruebas manuales locales**, no una batería completa de tests automáticos.

## 8. Errores comunes

| Situación | Causa habitual / acción |
| --- | --- |
| `401 Unauthorized` | Token ausente, inválido o vencido; revisar Bearer Token y secreto HS256 coincidente entre servicios. |
| `400` al agregar plato | `platoId` inexistente/no disponible, precio inválido o petición inválida. |
| `404` al consultar pedido | ID de pedido no encontrado. |
| `502` al consultar Menú | Fallo de Feign o del servicio Menú; revisar Eureka y que Menú esté `UP`. |
| Falla conexión a BD | Verificar base, puerto PostgreSQL, `DB_URL`, `DB_USER`, `DB_PASSWORD`. |
| Auth falla al registrar | Comprobar que el rol `ROLE_CLIENTE` existe en `auth_db`. |
| Menú no inicia con `validate` | Su esquema debe estar creado de antemano; pedir el script o procedimiento de inicialización. |

## 9. Limitaciones conocidas y pendientes del equipo

**Importante — autorización por usuario:** aunque las rutas exigen JWT válido, actualmente **no se comprueba que `clienteId` de la URL pertenezca al usuario autenticado**. Además, la consulta por ID de pedido no verifica propiedad. **No está listo para producción ni para exposición a usuarios reales** hasta corregir este punto (derivar la identidad del JWT y autorizar cada recurso).

Otros pendientes:

- Coordinar la ruta de Pedidos en Gateway y comprobarla con JWT.
- Acordar y completar estados del pedido, flujo de pago/entrega, edición de cantidades y vaciado del carrito si el alcance del grupo lo requiere.
- Definir scripts/migraciones de BD y datos iniciales por entorno; no depender de `ddl-auto: update` fuera de desarrollo.
- Confirmar manejo de cambios de precios, disponibilidad, fallos de red y propiedad del pedido antes de la integración final.


