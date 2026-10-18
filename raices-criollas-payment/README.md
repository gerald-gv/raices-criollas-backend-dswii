# Microservicio de Pagos — Raíces Criollas

Cobra los **pedidos** y las **reservas** con **Mercado Pago (Checkout Pro, Preferences API)**, moneda PEN.
Puerto **8085**. Base de datos propia: `payment_db` (PostgreSQL).

El cobro ocurre en la página de Mercado Pago: este servicio nunca recibe ni guarda datos de tarjeta.

---

## 1. Resumen de lo que hace

- Crea el cobro de un **pedido** o de una **reserva** y devuelve el enlace de pago (`urlPago`).
- **El monto siempre sale del servicio de origen** (total del pedido o `montoTotal` de la reserva). El cliente nunca lo envía.
- El enlace de pago **vence junto con el pedido o la reserva**.
- Confirma el resultado **consultando a Mercado Pago** (webhook, sincronización manual o job automático) y verifica el monto.
- Al aprobarse un pago, **avisa al servicio de origen** (Pedidos o Reservas) con un token de servicio.
- Cancela solo los pagos pendientes cuyo enlace venció y no tienen pagos en Mercado Pago.
- Reutiliza el pago pendiente de un mismo pedido o reserva en lugar de crear enlaces duplicados.
- Permite al administrador solicitar un reembolso total (ver limitaciones).

## 2. Arquitectura y puntos de contacto

| Servicio | Puerto | Relación con Pagos |
|---|---|---|
| Gateway | 8080 | Entrada única. Ruta pública: `/api/payment/**` (`StripPrefix=2`) |
| Auth | 8081 | Emite el JWT del usuario y los tokens de servicio (`payment-service`) |
| Pedidos | 8084 | Pagos lee el pedido (`GET /pedidos/{id}`) y lo marca pagado (`PUT /pedidos/interno/{id}/pagado`) |
| Reservas | 8083 | Pagos lee la reserva (`GET /reservas/{id}`) y la marca pagada (`PUT /reservas/interno/{id}/pagado`) |
| Mercado Pago | — | Preferencias, consulta/búsqueda de pagos y reembolsos |

La comunicación entre servicios usa Feign con el nombre registrado en Eureka (`raices-criollas-pedidos`, `raices-criollas-reservas`).

## 3. Endpoints

Rutas vía Gateway (`/api/payment/...`). Respuesta estándar: `ApiResponse { success, mensaje, data }`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/pagos` | JWT | Crea el cobro de un pedido **o** de una reserva. Body `{"pedidoId": N}` o `{"reservaId": N}` (**uno solo**) + header `Idempotency-Key`. Devuelve `urlPago` |
| GET | `/pagos/{id}` | JWT | Consulta un pago propio (404 si es de otro usuario) |
| GET | `/pagos?pedidoId=N` o `?reservaId=N` | JWT | Pagos propios de un pedido o de una reserva (uno solo de los dos parámetros) |
| POST | `/pagos/{id}/sincronizar` | JWT | Pregunta a Mercado Pago por el estado del pago y lo aplica |
| POST | `/pagos/{id}/reembolso` | JWT (ADMIN) | Reembolso total (ver limitaciones) |
| POST | `/webhooks/mercadopago` | Público | Aviso de Mercado Pago |

### Códigos de error más comunes

| Código | Cuándo |
|---|---|
| 400 | Falta `Idempotency-Key`; body sin origen o con ambos (`pedidoId` y `reservaId`) |
| 403 | Reembolso con un usuario que no es administrador |
| 404 | Pedido, reserva o pago inexistente **o ajeno** (no se revela que existe) |
| 409 | El pedido o la reserva no admite pago en su estado actual, ya fue pagado, está por vencer o vencido; clave de idempotencia usada con otra solicitud; pago no reembolsable |
| 502 | Mercado Pago rechazó la operación |
| 503 | Pedidos o Reservas no responden |

## 4. Flujos

### 4.1 Crear el cobro (`POST /pagos`)

1. **Idempotencia:** si la `Idempotency-Key` ya existe para el mismo usuario y el mismo origen, se devuelve el pago original. Si se usó con otra solicitud, 409.
2. Se consulta el origen **con el token del usuario**:
   - **Pedido:** debe ser del usuario, estar en `PENDIENTE_PAGO`, tener un total válido y no estar ya pagado.
   - **Reserva:** debe ser del usuario (Reservas responde 403 si es ajena; Pagos lo traduce a 404), estar `PENDIENTE` con `estadoPago` `PENDIENTE`, tener monto válido y no estar ya pagada.
3. **Vencimiento del enlace:**
   - Pedido: `fecha` del pedido + `PEDIDO_VIGENCIA_MINUTOS` (30 por defecto).
   - Reserva: exactamente `fechaExpiracionPago` (15 minutos desde que se crea la reserva).
   - Si faltan **menos de 2 minutos**, se responde 409 ("El plazo para pagar está por vencer o ya venció").
4. **Reutilización:** si el mismo usuario ya tiene un pago `PENDIENTE` de ese pedido o reserva, con enlace vigente (que no venza antes que el nuevo plazo) y el mismo monto, se devuelve ese en lugar de crear otro.
5. Se guarda el `Pago` en `PENDIENTE` y se crea la preferencia en Mercado Pago con `expires`, `expiration_date_from` y `expiration_date_to`.

### 4.2 Aplicar el resultado de un pago

Hay tres vías que comparten la misma lógica (`consultarYAplicar`):

- **Webhook** (`/webhooks/mercadopago`).
- **Sincronización manual** (`POST /pagos/{id}/sincronizar`): busca en Mercado Pago los pagos con la `external_reference` del pago.
- **Job automático** (`SincronizacionJob`): cada `SYNC_INTERVALO_MS` (30 s) sincroniza los pagos `PENDIENTE`/`RECHAZADO` creados en los últimos `SYNC_VENTANA_MINUTOS` (35).

`consultarYAplicar`: consulta el pago real → localiza el `Pago` por `referencia_externa` con bloqueo pesimista → **verifica el monto** → registra la transacción (sin duplicados) → traduce el estado → valida la transición.

| Estado actual | Puede pasar a |
|---|---|
| PENDIENTE | Cualquiera distinto de PENDIENTE |
| RECHAZADO | Cualquiera distinto de RECHAZADO (el cliente puede reintentar) |
| APROBADO | Solo REEMBOLSADO |
| CANCELADO, REEMBOLSADO | Ninguno |

Equivalencias con Mercado Pago: `approved→APROBADO`, `rejected→RECHAZADO`, `cancelled→CANCELADO`, `refunded→REEMBOLSADO`, el resto → `PENDIENTE`.

### 4.3 Aviso al servicio de origen

Al pasar a `APROBADO`, Pagos obtiene un **token de servicio** de Auth (`serviceName = payment-service`, con caché y un reintento ante 401) y llama:

- Pedido: `PUT /pedidos/interno/{id}/pagado`
- Reserva: `PUT /reservas/interno/{id}/pagado`

Resultados:

- **409 o 404 del servicio de origen** (pedido o reserva cancelado, o reserva vencida con la mesa ya tomada): el pago **sí queda `APROBADO`** (el dinero ya se cobró) y se registra `REVISION MANUAL` en el log.
- **El servicio de origen no responde:** se revierte la transacción y el pago sigue `PENDIENTE`; se reintenta con el job o el siguiente aviso.

### 4.4 Vencimiento de pagos pendientes

En cada ciclo, el job busca pagos `PENDIENTE` cuyo `vence_en` pasó hace más de `app.sync.gracia-minutos` (2 por defecto). Para cada uno consulta Mercado Pago:

- Si **existe algún pago** en Mercado Pago (aprobado, pendiente, rechazado…), se aplica su resultado y **no** se cancela. Esto evita cancelar un pago hecho con un medio que tarda en confirmarse.
- Si **no existe ninguno**, el pago pasa a `CANCELADO`.

### 4.5 Reembolso (administrador)

`POST /pagos/{id}/reembolso` (solo `ROLE_ADMIN`): reembolso **total**, idempotente (clave `reembolso-pago-{id}` en Mercado Pago), con bloqueo del pago. Registra una transacción de tipo `REEMBOLSO` y pasa el pago a `REEMBOLSADO`. **No avisa a Pedidos ni a Reservas.** Ver limitaciones.

## 5. Modelo de datos

El esquema lo genera Hibernate (`ddl-auto: update`, sin Flyway).

**`pagos`**

| Columna | Notas |
|---|---|
| `id` | PK |
| `tipo` | `PEDIDO` o `RESERVA` (obligatoria) |
| `pedido_id` | Opcional: solo en pagos de pedidos |
| `reserva_id` | Opcional: solo en pagos de reservas |
| `usuario_id` | Dueño del pago |
| `monto`, `moneda` | `NUMERIC(10,2)`, `PEN` |
| `estado` | `PENDIENTE`, `APROBADO`, `RECHAZADO`, `CANCELADO`, `REEMBOLSADO` |
| `mp_preference_id`, `mp_payment_id`, `url_pago` | Datos de Mercado Pago |
| `referencia_externa` | UUID único; es el `external_reference` en Mercado Pago |
| `idempotency_key` | Única |
| `vence_en` | Instante en que vence el enlace de pago (nulo en filas antiguas) |
| `creado_en`, `actualizado_en` | Auditoría |

Índices en `pedido_id` y `reserva_id`.

**`transacciones_pago`**: historial de solo inserción (`pago_id`, `tipo` `COBRO`/`REEMBOLSO`, `mp_payment_id`, `estado_mp`, `monto`, `respuesta_raw`, `creado_en`). No se duplican filas con el mismo `pago + mp_payment_id + estado_mp`.

> **Actualización desde una versión anterior:** `tipo` es obligatoria y Hibernate no puede añadirla a filas existentes. Hay que borrar las tablas antes de arrancar (en cada base de datos: local y Docker):
> ```sql
> DROP TABLE transacciones_pago, pagos;
> ```
> Con Docker, sin abrir puertos:
> ```
> docker exec -it raices-criollas-postgres-payment psql -U postgres -d payment_db -c "DROP TABLE transacciones_pago, pagos;"
> ```

## 6. Seguridad

- JWT como *resource server* (HS256, clave Base64 en `JWT_SECRET`, claim `roles`, `sub` = id de usuario).
- `POST /webhooks/mercadopago` es público; el resto exige autenticación.
- El reembolso usa `@PreAuthorize("hasRole('ADMIN')")`.
- El monto nunca viene del cliente. El estado de un pago siempre se confirma consultando a Mercado Pago.
- El webhook **no valida la firma** `x-signature` (proyecto educativo).

## 7. Variables de entorno

| Variable | Obligatoria | Notas |
|---|---|---|
| `JWT_SECRET` | Sí | Base64, **idéntica** en todos los servicios. Sin `\`, comillas ni espacios |
| `INTERNAL_SECRET` | Sí | **Idéntica** en Auth, Pedidos y Pagos |
| `MP_ACCESS_TOKEN` | Sí | Credencial de Mercado Pago. **Secreta: nunca en el repo ni en chats** |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | Docker / local | Por defecto `jdbc:postgresql://localhost:5432/payment_db` |
| `EUREKA_URL`, `EUREKA_HOSTNAME` | Docker | |
| `FRONTEND_URL` | No | Por defecto `http://localhost:3000`. Mercado Pago devuelve al cliente a `/pago/exito`, `/pago/pendiente`, `/pago/error` |
| `MP_PUBLIC_URL` | No | Dominio público para `notification_url` del webhook. Vacío si no hay túnel |
| `PEDIDO_VIGENCIA_MINUTOS` | No | Por defecto 30. **Debe coincidir con `pedido-pendiente-minutos` de Pedidos** |
| `PEDIDO_ZONA_HORARIA` | No | Por defecto `America/Lima`. Debe ser la zona de la JVM de Pedidos |
| `SYNC_ACTIVO`, `SYNC_INTERVALO_MS`, `SYNC_VENTANA_MINUTOS` | No | `true` / `30000` / `35` |

Propiedades sin variable de entorno asociada (se definen en `application.yml` o con `-D`): `app.sync.gracia-minutos` (2) y `app.reservas.zona-horaria` (`America/Lima`; Reservas fija esa zona por código).

## 8. Ejecución

**Local (IntelliJ):** levantar Eureka → Auth, Menu, Pedidos, Reservas, RabbitMQ, Pagos → Gateway. Cada servicio es accesible por su puerto directo.

**Docker:** `docker compose up -d --build`. Los servicios no publican puertos; todo entra por el Gateway (`localhost:8080`). No se pueden mezclar servicios de IntelliJ con el Gateway en Docker.

Consultas útiles en Docker:

```
docker compose logs -f payment
docker exec -it raices-criollas-postgres-payment psql -U postgres -d payment_db -c "SELECT id, tipo, pedido_id, reserva_id, estado, monto, vence_en FROM pagos ORDER BY id;"
docker exec -it raices-criollas-postgres-payment psql -U postgres -d payment_db -c "SELECT pago_id, tipo, estado_mp, monto FROM transacciones_pago ORDER BY id;"
```

## 9. Guía de pruebas

Todo por el Gateway. Requisitos: Eureka, Auth, Menu, Pedidos, Reservas, RabbitMQ, Pagos y Gateway arriba. Usuarios de demostración en `dbInit/auth_db.sql`. Para pagar se usa una **cuenta compradora de prueba** de Mercado Pago, en ventana de incógnito, con tarjeta de prueba aprobada.

### Pedidos

| # | Prueba | Esperado |
|---|---|---|
| 1 | Login de cliente y administrador | 200, token en `data.accessToken` |
| 2 | Crear pedido (carrito + confirmar) | 201, `PENDIENTE_PAGO` |
| 3 | `POST /pagos` `{"pedidoId":N}` con `Idempotency-Key` | 201, `tipo: PEDIDO`, `monto` = total, `urlPago` y `venceEn` |
| 4 | Repetir con la misma clave / con otra clave | Mismo pago |
| 5 | Otro usuario, `pedidoId` inexistente, sin header, body `{}` | 404 / 404 / 400 / 400 |
| 6 | `POST /pagos/{id}/sincronizar` antes de pagar | 200, sigue `PENDIENTE` |
| 7 | Pagar y esperar ≤30 s | `APROBADO`; el pedido pasa a `PAGADO`; baja el stock |
| 8 | Repetir `sincronizar` | Sin cambios, sin transacciones duplicadas |
| 9 | Cancelar el pedido pagado / nuevo `POST /pagos` del mismo pedido | 409 |
| 10 | Detener Pedidos, pagar, esperar un ciclo, volver a iniciarlo | Con Pedidos caído el pago sigue `PENDIENTE`; al volver pasa a `APROBADO` solo |

### Reservas

| # | Prueba | Esperado |
|---|---|---|
| 11 | `POST /pagos` `{"reservaId":N}` | 201, `tipo: RESERVA`, `monto` = `montoTotal`, `venceEn` = `fechaExpiracionPago` |
| 12 | Repetir con otra clave | Mismo pago (reutilización) |
| 13 | Reserva ajena / inexistente | 404 / 404 |
| 14 | Reserva cancelada | 409 |
| 15 | Pagar y esperar ≤30 s | `APROBADO`; la reserva pasa a `CONFIRMADA` / `PAGADO` |
| 16 | Detener Reservas, pagar, esperar, volver a iniciarla | Pago `PENDIENTE` mientras está caída; luego `APROBADO` y reserva confirmada |
| 17 | `GET /pagos?reservaId=N`; con ambos parámetros o ninguno | Lista / 400 |

### Vencimiento y cancelación

| # | Prueba | Esperado |
|---|---|---|
| 18 | Consultar la preferencia en Mercado Pago (`GET /checkout/preferences/{mp_preference_id}`) | `expires: true`, `expiration_date_to` = `venceEn` |
| 19 | Con `PEDIDO_VIGENCIA_MINUTOS=3`, crear un pago y no pagar; esperar ~6 min | `CANCELADO` |
| 20 | Igual, pero pagar a tiempo y esperar ~6 min | Sigue `APROBADO` |
| 21 | Crear el pago cuando faltan menos de 2 minutos | 409 "por vencer" |

### Reembolso

| # | Prueba | Esperado |
|---|---|---|
| 22 | Reembolso con un cliente | 403 |
| 23 | Reembolso con un administrador | Con credenciales de prueba da **502** (ver limitaciones). El pago queda `APROBADO` |
| 24 | Reembolso sobre un pago `PENDIENTE` / id inexistente | 409 / 404 |

## 10. Cambios respecto a la versión inicial

### En Pagos

1. **Reembolsos:** endpoint `POST /pagos/{id}/reembolso` solo para administradores. DTO `ReembolsoMP`, excepción `PagoNoReembolsableException` (409), método `reembolsar` en el cliente de Mercado Pago y en el servicio, con bloqueo (`findByIdParaActualizar`) e idempotencia.
2. **Vigencia del enlace:** la preferencia se crea con `expires`, `expiration_date_from` y `expiration_date_to`, alineada al plazo del pedido. Se añadió `fecha` a `PedidoData`. Nuevas propiedades `PEDIDO_VIGENCIA_MINUTOS` y `PEDIDO_ZONA_HORARIA`.
3. **Vencimiento guardado:** nueva columna `vence_en` en `pagos` y campo `venceEn` en la respuesta.
4. **Cancelación de pagos vencidos:** el job pasa a `CANCELADO` los pagos `PENDIENTE` vencidos sin pagos en Mercado Pago (con 2 minutos de gracia).
5. **Reutilización del pago pendiente:** el mismo pedido o reserva no genera enlaces duplicados.
6. **Pagos de reservas:** `tipo` y `reserva_id` en `pagos`; `pedido_id` pasa a ser opcional. Nuevo `ReservaClient`, `ReservaNotFoundException` (404), body `{"reservaId":N}`, listado `GET /pagos?reservaId=N`, y el aviso de pago se dirige a Pedidos o a Reservas según el tipo.
7. **Mensajes de error:** el 502 de reembolso ya no dice "iniciar el cobro"; `ServicioNoDisponibleException` habla de pedido o reserva.
8. **Título del ítem en Mercado Pago:** "Pedido #N" o "Reserva #N".

### En Reservas (servicio de otro equipo; revisar e integrar)

- Nuevo endpoint interno `PUT /reservas/interno/{id}/pagado`, solo `ROLE_SERVICE` (regla agregada **antes** de `anyRequest().authenticated()` en `SecurityConfig`).
- Método `marcarPagada` en el servicio y `findByIdParaActualizar` (bloqueo pesimista) en el repositorio.
- Reglas: idempotente; solo desde `PENDIENTE`/`PENDIENTE` (si no, 409); si la reserva ya expiró, se acepta **solo si la mesa sigue libre** (si otra reserva la tomó, 409).

## 11. Limitaciones y riesgos conocidos

- **Reembolso por API con cuentas de prueba:** Mercado Pago responde 401 ("Unauthorized use of live credentials"), aunque el panel de Mercado Pago sí permite devolver el dinero. Se probó con dos credenciales distintas y por llamada directa, fuera de este servicio. El endpoint está implementado, pero **no está probado de punta a punta**. Alternativa: devolver el dinero en el panel y luego llamar a `POST /pagos/{id}/sincronizar`.
- **El reembolso no avisa a Pedidos ni a Reservas:** el pedido queda `PAGADO` y la reserva `CONFIRMADA`.
- **Cancelar un pedido o una reserva no invalida el enlace de pago:** si se paga después, el pago queda `APROBADO` y se marca `REVISION MANUAL` en el log (requiere reembolso manual). Mitigarlo exige que esos servicios avisen a Pagos.
- **Pago aprobado sin stock:** el descuento de stock es asíncrono (RabbitMQ); si falla, el error queda en la cola de errores de Menu.
- **Webhook sin firma** (`x-signature`): aceptable para un proyecto educativo.
- **Vigencia duplicada:** los 30 minutos están en Pedidos y en Pagos; si uno cambia, hay que cambiar el otro.
- **Zona horaria:** Pagos interpreta la `fecha` del pedido con `PEDIDO_ZONA_HORARIA`; debe coincidir con la zona de la JVM de Pedidos (en Docker la fijan las anclas de zona del compose).
- **Concurrencia:** dos peticiones simultáneas con claves distintas para el mismo origen podrían crear dos pagos.
- **Carga extra del job:** un pago vencido con un pago pendiente en Mercado Pago que nunca se resuelve se consulta en cada ciclo.
- **Frontend:** al volver de Mercado Pago debe llamar a `POST /pagos/{id}/sincronizar` (si no, el job lo aplica en ≤30 s) y no confiar en los parámetros de la URL de retorno. Un pago reutilizado se devuelve con `201` y el mismo `urlPago`.

## 12. Errores frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| Error al arrancar por la columna `tipo` | Tabla `pagos` anterior con filas | `DROP TABLE transacciones_pago, pagos;` |
| `Illegal base64 character` al arrancar | `JWT_SECRET` con `\` o caracteres extra | Copiar la clave de Auth sin escapes; idéntica en todos |
| Pago aprobado pero pedido o reserva sin cambiar | El servicio de origen está caído o respondió 409/404 | Revisar el log de Pagos (`no respondio` o `REVISION MANUAL`) y llamar a `/sincronizar` |
| 401 al crear la preferencia | `MP_ACCESS_TOKEN` incorrecto | Revisar la credencial (nunca pegarla en chats) |
| Enlace de pago vencido | Pasó el plazo del pedido o de la reserva | Crear un pedido o reserva nuevo y su pago |
| 400 "Indica pedidoId o reservaId, pero solo uno" | Body con ambos o ninguno | Enviar solo uno |
| 500 "Ha ocurrido un error inesperado" en Reservas con una ruta inexistente | El handler genérico de Reservas captura rutas no encontradas | Revisar la URL (por el Gateway las rutas de Reservas llevan el prefijo duplicado `/api/reservas/reservas/...`) |
