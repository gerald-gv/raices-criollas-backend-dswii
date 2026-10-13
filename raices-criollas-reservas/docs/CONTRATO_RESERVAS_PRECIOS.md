# Contrato de Integración y Especificación Técnica: Reservas con Precios y Estados de Pago
**Proyecto:** Raíces Criollas — Microservicio `raices-criollas-reservas`  
**Versión:** 2.0.0 (Reestructuración con Precios y Preparación para Mercado Pago)  
**Autor:** Especialista Backend & Arquitecto de Software  
**Fecha de Actualización:** Octubre 2026  

---

## 1. Resumen Ejecutivo de la Reestructuración

El microservicio `raices-criollas-reservas` ha evolucionado desde un gestor básico de disponibilidad física hacia un **módulo transaccional de reservas comerciales**. Esta versión incorpora:

1. **Modelo de Precios en Soles Peruanos (`PEN`):** Tarifas base configurables por mesa y recargos por comensal calculados estrictamente por el backend con precisión financiera (`BigDecimal`, escala 2).
2. **Endpoint de Cotización Previa (`POST /reservas/cotizar`):** Permite al comensal o al administrador previsualizar el desglose de tarifas y validar disponibilidad antes de comprometer la reserva.
3. **Ciclo de Vida de Pago Desacoplado (`EstadoPago`):** Coexistencia armónica entre el estado logístico de la reserva (`EstadoReserva`) y su estado financiero (`EstadoPago`), inicializando en `PENDIENTE` / `PENDIENTE`.
4. **Expiración Temporal Automática y Liberación de Mesas:** Ventana de tolerancia de pago (por defecto 15 minutos). Si la reserva no es pagada dentro de dicha ventana, el motor de disponibilidad libera automáticamente la mesa para otros clientes sin requerir tareas programadas invasivas.
5. **Preparación Arquitectónica para Mercado Pago:** Estructura alineada con el microservicio `raices-criollas-payment`, dejando la reserva lista para recibir eventos de confirmación de pago.

---

## 2. Modelo de Datos y Persistencia PostgreSQL

El módulo opera sobre la base de datos independiente `reservas_db`, respetando el patrón **Database per Service**.

### 2.1. Entidad `Mesa` (`mesas`)

| Columna | Tipo SQL | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK`, Autoincremental | Identificador único de la mesa. |
| `numero_mesa` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Código físico visible de la mesa (ej. `M-01`, `VIP-1`). |
| `capacidad` | `INTEGER` | `NOT NULL`, `CHECK (> 0)` | Número máximo de comensales sentados. |
| `ubicacion` | `VARCHAR(255)` | Opcional | Sector del restaurante (ej. `Terraza Exterior`, `Salón Principal`). |
| `precio_base` | `NUMERIC(10, 2)` | `NOT NULL DEFAULT 20.00`, `CHECK (>= 0)` | Tarifa base de reserva asignada a la mesa en Soles (`PEN`). |
| `activo` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Flag de disponibilidad operativa. |

### 2.2. Entidad `Reserva` (`reservas`)

| Columna | Tipo SQL | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK`, Autoincremental | Identificador único de la reserva. |
| `cliente_id` | `BIGINT` | `NOT NULL` | ID del cliente extraído del token JWT (`sub`). Desacoplado de `auth_db`. |
| `mesa_id` | `BIGINT` | `NOT NULL`, `FK -> mesas(id)` | Mesa asignada a la reserva. |
| `fecha_inicio` | `TIMESTAMP` | `NOT NULL` | Inicio de la franja horaria reservada. |
| `fecha_fin` | `TIMESTAMP` | `NOT NULL`, `CHECK (inicio < fin)` | Fin de la franja horaria reservada. |
| `cantidad_personas` | `INTEGER` | `NOT NULL`, `CHECK (> 0)` | Comensales declarados. |
| `monto_total` | `NUMERIC(10, 2)` | `NOT NULL DEFAULT 0.00`, `CHECK (>= 0)` | **Importe total calculado y congelado históricamente**. |
| `moneda` | `VARCHAR(3)` | `NOT NULL DEFAULT 'PEN'` | Código ISO de la divisa (actualmente `PEN`). |
| `estado` | `VARCHAR(20)` | `NOT NULL`, `CHECK IN (...)` | Estado operativo: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`. |
| `estado_pago` | `VARCHAR(20)` | `NOT NULL`, `CHECK IN (...)` | Estado financiero: `PENDIENTE`, `PAGADO`, `FALLIDO`, `REEMBOLSADO`. |
| `fecha_expiracion_pago` | `TIMESTAMP` | Opcional | Límite temporal tras el cual una reserva pendiente expira y libera la mesa. |
| `observaciones` | `VARCHAR(500)` | Opcional | Solicitudes especiales del comensal. |
| `fecha_creacion` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Momento exacto de registro en base de datos. |
| `fecha_actualizacion`| `TIMESTAMP` | Opcional | Registro de última modificación. |

---

## 3. Reglas de Negocio del Cálculo de Precios

### 3.1. Fórmula Oficial de Cotización
$$\text{montoTotal} = \text{precioBaseMesa} + (\text{tarifaPorPersona} \times \text{cantidadPersonas})$$

* **$\text{precioBaseMesa}$**: Valor configurado en la mesa (`mesa.precioBase`). Si es nulo, el sistema recurre al valor por defecto global `app.reservas.tarifa-base-mesa-default` (S/ 20.00).
* **$\text{tarifaPorPersona}$**: Tarifa adicional por comensal configurada en `app.reservas.tarifa-por-persona-default` (S/ 5.00).
* **$\text{cantidadPersonas}$**: Número de comensales ingresado por el usuario ($1 \le \text{personas} \le \text{mesa.capacidad}$).

### 3.2. Precisión Financiera y Redondeo
* Todos los importes se procesan exclusivamente utilizando la clase `java.math.BigDecimal` con escala `2` y modo de redondeo `RoundingMode.HALF_UP`.
* Se prohíbe terminantemente el uso de tipos `double` o `float` para importes monetarios.

### 3.3. Seguridad: Inmunidad contra Manipulación desde el Frontend
* **El frontend NO envía importes ni precios en el body de creación de reserva (`ReservaRequestDTO`).**
* El backend ignora cualquier intento de suministrar precios externos y calcula el monto consultando la entidad `Mesa` directamente en la base de datos bajo bloqueo pesimista (`PESSIMISTIC_WRITE`).
* Una vez calculada y guardada la reserva, el `monto_total` queda congelado como comprobante histórico. Si el restaurante actualiza la tarifa base de la mesa en el futuro, las reservas previamente creadas no sufren alteraciones.

---

## 4. Máquina de Estados y Ciclo de Expiración

### 4.1. Coexistencia de Estados

```
[ CREACIÓN ]
     │
     ▼
EstadoReserva: PENDIENTE
EstadoPago:    PENDIENTE
fechaExpiracionPago: ahora + 15 min
     │
     ├──────────────────────────────────────────┬──────────────────────────────────────────┐
     ▼ (Pago Exitoso / Simulación)              ▼ (Expiración > 15 min sin pagar)          ▼ (Cancelación voluntaria)
EstadoReserva: CONFIRMADA                  EstadoReserva: CANCELADA                   EstadoReserva: CANCELADA
EstadoPago:    PAGADO                      EstadoPago:    FALLIDO                     EstadoPago:    REEMBOLSADO / FALLIDO
     │                                          │                                          │
     ▼ (Cliente Asiste)                         ▼ (Mesa Liberada Inmediatamente)           ▼ (Mesa Liberada Inmediatamente)
EstadoReserva: COMPLETADA
```

### 4.2. Mecanismo Dinámico de Liberación de Disponibilidad (Zero-Lag)
A diferencia de arquitecturas que dependen de un cron job para marcar registros vencidos, el repositorio de datos de Raíces Criollas implementa una **consulta de solapamiento inteligente**:

```sql
-- Una reserva existente bloquea la mesa ÚNICAMENTE si:
(r.estado = 'CONFIRMADA')
OR
(r.estado = 'PENDIENTE' AND r.estado_pago = 'PENDIENTE' AND r.fecha_expiracion_pago > :ahora)
```

**Resultado:**
1. Durante los primeros 15 minutos, la mesa está protegida exclusivamente para el cliente que inició la reserva.
2. Al cumplirse el minuto 16 sin que el pago se haya completado, cualquier otro comensal que consulte disponibilidad verá la mesa **completamente libre** en tiempo real, sin retrasos de sincronización.

---

## 5. Catálogo Completo de Endpoints REST

Todos los endpoints que devuelven datos responden bajo el envoltorio estandarizado `ApiResponse<T>`:

```json
{
  "success": true,
  "mensaje": "Mensaje descriptivo",
  "data": { ... }
}
```

---

### Endpoint 1: Cotizar Reserva Previa
Calcula el presupuesto exacto, el desglose y la disponibilidad de una mesa antes de confirmar.

* **Método:** `POST`
* **Ruta:** `/reservas/cotizar`
* **Autorización:** **Público (PermitAll)** — Permite cotizaciones previas antes o después del inicio de sesión.
* **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "mesaId": 3,
  "fechaInicio": "2026-10-15T13:00:00",
  "fechaFin": "2026-10-15T15:00:00",
  "cantidadPersonas": 4
}
```

#### Response (HTTP 200 OK — Mesa Disponible):
```json
{
  "success": true,
  "mensaje": "Cotización generada exitosamente",
  "data": {
    "mesaId": 3,
    "numeroMesa": "M-03",
    "capacidadMesa": 4,
    "cantidadPersonas": 4,
    "fechaInicio": "2026-10-15T13:00:00",
    "fechaFin": "2026-10-15T15:00:00",
    "duracionMinutos": 120,
    "moneda": "PEN",
    "precioBaseMesa": 25.00,
    "tarifaBaseMesa": 25.00,
    "tarifaPorPersona": 5.00,
    "subtotalPersonas": 20.00,
    "montoTotal": 45.00,
    "disponible": true,
    "mensaje": "Mesa disponible para cotización",
    "desglose": "Tarifa base de mesa: S/ 25.00 + 4 personas a S/ 5.00 c/u: S/ 20.00"
  }
}
```

#### Response (HTTP 200 OK — Mesa Ocupada o Exceso de Capacidad):
```json
{
  "success": true,
  "mensaje": "Cotización generada exitosamente",
  "data": {
    "mesaId": 3,
    "numeroMesa": "M-03",
    "capacidadMesa": 4,
    "cantidadPersonas": 4,
    "fechaInicio": "2026-10-15T13:00:00",
    "fechaFin": "2026-10-15T15:00:00",
    "duracionMinutos": 120,
    "moneda": "PEN",
    "precioBaseMesa": 25.00,
    "tarifaBaseMesa": 25.00,
    "tarifaPorPersona": 5.00,
    "subtotalPersonas": 20.00,
    "montoTotal": 45.00,
    "disponible": false,
    "mensaje": "La mesa no está disponible para el intervalo de tiempo seleccionado",
    "desglose": "Tarifa base de mesa: S/ 25.00 + 4 personas a S/ 5.00 c/u: S/ 20.00"
  }
}
```

---

### Endpoint 2: Crear Reserva (Pendiente de Pago)
Crea la reserva formal a nombre del usuario autenticado. El cliente no envía precios; el backend los calcula y fija la expiración.

* **Método:** `POST`
* **Ruta:** `/reservas`
* **Autorización:** `ROLE_CLIENTE` o `ROLE_ADMIN`
* **Headers:**  
  `Authorization: Bearer <TOKEN_JWT>`  
  `Content-Type: application/json`

#### Request Body:
```json
{
  "mesaId": 3,
  "fechaInicio": "2026-10-15T13:00:00",
  "fechaFin": "2026-10-15T15:00:00",
  "cantidadPersonas": 4,
  "observaciones": "Celebración de cumpleaños, cerca a la ventana"
}
```

#### Response (HTTP 201 Created):
```json
{
  "success": true,
  "mensaje": "Reserva creada exitosamente",
  "data": {
    "id": 105,
    "clienteId": 14,
    "mesa": {
      "id": 3,
      "numeroMesa": "M-03",
      "capacidad": 4,
      "ubicacion": "Salón Principal - Esquina Romántica",
      "precioBase": 25.00,
      "activo": true
    },
    "fechaInicio": "2026-10-15T13:00:00",
    "fechaFin": "2026-10-15T15:00:00",
    "cantidadPersonas": 4,
    "montoTotal": 45.00,
    "moneda": "PEN",
    "estado": "PENDIENTE",
    "estadoPago": "PENDIENTE",
    "fechaCreacion": "2026-10-13T02:00:00",
    "fechaExpiracionPago": "2026-10-13T02:15:00",
    "observaciones": "Celebración de cumpleaños, cerca a la ventana",
    "fechaActualizacion": null
  }
}
```

#### Respuestas de Error Comunes:
* **HTTP 400 Bad Request:**  
  `"La mesa no está disponible para el intervalo de tiempo seleccionado"`  
  `"La cantidad de personas (5) supera la capacidad máxima de la mesa (4)"`  
  `"No se puede realizar una reserva en una fecha u hora pasada"`
* **HTTP 401 Unauthorized:**  
  `"Autenticación requerida o token inválido"`

---

### Endpoint 3: Consultar Mis Reservas (Historial del Cliente)
Permite al cliente autenticado ver todas sus reservas con sus importes y estados de pago.

* **Método:** `GET`
* **Ruta:** `/reservas/mis-reservas`
* **Autorización:** `ROLE_CLIENTE` o `ROLE_ADMIN`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>`

#### Response (HTTP 200 OK):
```json
{
  "success": true,
  "mensaje": "Historial de reservas obtenido exitosamente",
  "data": [
    {
      "id": 105,
      "clienteId": 14,
      "mesa": {
        "id": 3,
        "numeroMesa": "M-03",
        "capacidad": 4,
        "ubicacion": "Salón Principal - Esquina Romántica",
        "precioBase": 25.00,
        "activo": true
      },
      "fechaInicio": "2026-10-15T13:00:00",
      "fechaFin": "2026-10-15T15:00:00",
      "cantidadPersonas": 4,
      "montoTotal": 45.00,
      "moneda": "PEN",
      "estado": "PENDIENTE",
      "estadoPago": "PENDIENTE",
      "fechaCreacion": "2026-10-13T02:00:00",
      "fechaExpiracionPago": "2026-10-13T02:15:00",
      "observaciones": "Celebración de cumpleaños",
      "fechaActualizacion": null
    }
  ]
}
```

---

### Endpoint 4: Cancelar Mi Reserva
Cancela una reserva propia antes de que se consume.

* **Método:** `PATCH`
* **Ruta:** `/reservas/{id}/cancelar`
* **Autorización:** `ROLE_CLIENTE` o `ROLE_ADMIN`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>`

#### Response (HTTP 200 OK):
```json
{
  "success": true,
  "mensaje": "Reserva cancelada exitosamente",
  "data": {
    "id": 105,
    "clienteId": 14,
    "estado": "CANCELADA",
    "estadoPago": "PENDIENTE",
    "fechaActualizacion": "2026-10-13T02:05:00"
  }
}
```

---

### Endpoint 5: Consultar Todas las Reservas (Panel de Administración)
Filtra reservas por mesa, estado de reserva, estado de pago y rangos de fechas.

* **Método:** `GET`
* **Ruta:** `/reservas`
* **Autorización:** `ROLE_ADMIN`
* **Query Params:**
  * `mesaId` *(opcional)*: ID de mesa.
  * `estado` *(opcional)*: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`.
  * `estadoPago` *(opcional)*: `PENDIENTE`, `PAGADO`, `FALLIDO`, `REEMBOLSADO`.
  * `desde` *(opcional, ISO Date-Time)*: ej. `2026-10-01T00:00:00`.
  * `hasta` *(opcional, ISO Date-Time)*: ej. `2026-10-31T23:59:59`.

#### Response (HTTP 200 OK):
```json
{
  "success": true,
  "mensaje": "Listado de reservas obtenido exitosamente",
  "data": [
    {
      "id": 105,
      "clienteId": 14,
      "montoTotal": 45.00,
      "moneda": "PEN",
      "estado": "CONFIRMADA",
      "estadoPago": "PAGADO"
    }
  ]
}
```

---

### Endpoint 6: Actualizar Estado de Reserva y de Pago (Admin)
Permite al administrador modificar manualmente el estado operativo o registrar una confirmación de pago manual/contingente.

* **Método:** `PATCH`
* **Ruta:** `/reservas/{id}/estado`
* **Autorización:** `ROLE_ADMIN`
* **Request Body:**
```json
{
  "estado": "CONFIRMADA",
  "estadoPago": "PAGADO"
}
```

#### Response (HTTP 200 OK):
```json
{
  "success": true,
  "mensaje": "Estado de la reserva actualizado exitosamente",
  "data": {
    "id": 105,
    "estado": "CONFIRMADA",
    "estadoPago": "PAGADO",
    "fechaActualizacion": "2026-10-13T02:10:00"
  }
}
```

---

### Endpoint 7: Consultar Mesas Disponibles
Consulta pública de catálogo de mesas que cumplen los criterios de capacidad y fecha/hora libre.

* **Método:** `GET`
* **Ruta:** `/mesas/disponibles`
* **Autorización:** **Público (PermitAll)**
* **Query Params:**
  * `fechaInicio` *(obligatorio)*: `2026-10-15T13:00:00`
  * `fechaFin` *(obligatorio)*: `2026-10-15T15:00:00`
  * `cantidadPersonas` *(opcional, default 1)*: `4`

#### Response (HTTP 200 OK):
```json
{
  "success": true,
  "mensaje": "Mesas disponibles obtenidas exitosamente",
  "data": [
    {
      "id": 3,
      "numeroMesa": "M-03",
      "capacidad": 4,
      "ubicacion": "Salón Principal - Esquina Romántica",
      "precioBase": 25.00,
      "activo": true
    }
  ]
}
```

---

## 6. Guía de Integración Paso a Paso para el Frontend

### Paso 1: Selección de Fecha, Hora y Comensales
El cliente elige fecha, hora y número de personas. El frontend consulta:
`GET /mesas/disponibles?fechaInicio=...&fechaFin=...&cantidadPersonas=...`
Cada mesa devuelta incluye su `precioBase` para mostrar un distintivo como:
> *"Mesa M-03 (Capacidad 4) — Tarifa Base: S/ 25.00"*

### Paso 2: Cotización en Tiempo Real
Al hacer clic en una mesa o al cambiar los comensales, el frontend llama a:
`POST /reservas/cotizar`
El modal o sección de resumen renderiza el desglose exacto:
* Tarifa Base Mesa: `S/ 25.00`
* Cargo por 4 Comensales (S/ 5.00 c/u): `S/ 20.00`
* **Total a Pagar:** `S/ 45.00 PEN`
* Si `disponible: false`, el botón de "Confirmar Reserva" se deshabilita y se muestra el mensaje de alerta devuelto por la API.

### Paso 3: Confirmación y Creación de la Reserva
Si el usuario no está autenticado, se solicita iniciar sesión. Con el token JWT:
`POST /reservas` enviando `{ mesaId, fechaInicio, fechaFin, cantidadPersonas, observaciones }`.
El backend responde `HTTP 201 Created` con:
* `id: 105`
* `montoTotal: 45.00`
* `estado: "PENDIENTE"`
* `estadoPago: "PENDIENTE"`
* `fechaExpiracionPago: "2026-10-13T02:15:00"`

### Paso 4: Pantalla de "Reserva Pendiente de Pago" y Temporizador
El frontend redirige a la vista `/reservas/105/pago` mostrando:
* Un **temporizador de cuenta regresiva de 15 minutos** basado en `fechaExpiracionPago`.
* Si el temporizador llega a cero, el frontend deshabilita las opciones de pago y muestra un aviso:
  > *"Su reserva ha expirado. Por favor seleccione su mesa nuevamente."*
* Resumen del pedido con `montoTotal` en Soles (`S/ 45.00 PEN`).
* Botón de acción: *"Pagar Reserva"* (preparado para Mercado Pago).

---

## 7. Preparación para la Futura Integración con Mercado Pago

Cuando el equipo decida habilitar pagos reales vía Mercado Pago, el microservicio `raices-criollas-payment` se integrará de la siguiente forma:

1. **Creación de Preferencia en Mercado Pago:**
   El frontend o gateway invocará a `raices-criollas-payment`:
   ```json
   POST /api/payments/create-preference
   {
     "reservaId": 105,
     "monto": 45.00,
     "moneda": "PEN",
     "descripcion": "Reserva Raíces Criollas - Mesa M-03 (4 personas)"
   }
   ```
2. **Webhook / Callback de Pago:**
   Mercado Pago notificará al microservicio `raices-criollas-payment`. Una vez validada la firma y acreditado el dinero:
   `raices-criollas-payment` enviará una notificación (HTTP interno o evento de mensajería) a `raices-criollas-reservas`:
   ```json
   PATCH /reservas/105/estado
   {
     "estado": "CONFIRMADA",
     "estadoPago": "PAGADO"
   }
   ```
3. La reserva pasa de forma definitiva a confirmada y la mesa queda garantizada.

---

## 8. Verificación de Scripts SQL y Migración de Base de Datos

Para aplicar los cambios en la base de datos PostgreSQL:

* **Si se instala el microservicio desde cero:**
  Ejecutar secuencialmente en pgAdmin 4:
  1. `01_crear_base_datos.sql` (en `postgres`).
  2. `02_esquema_reservas.sql` (en `reservas_db`).
  3. `03_datos_prueba_reservas.sql` (en `reservas_db`).

* **Si la base de datos `reservas_db` ya existe con datos previos:**
  Ejecutar el script de migración no destructivo:
  `04_migracion_precios_y_pagos.sql` (en `reservas_db`).
  Este script añadirá `precio_base` a `mesas`, `monto_total`, `moneda`, `estado_pago` y `fecha_expiracion_pago` a `reservas` sin alterar los registros existentes.

---

## 9. Matriz de Pruebas Automatizadas

El microservicio cuenta con **32 pruebas unitarias y de integración** pasando satisfactoriamente:

| Clase de Prueba | Cantidad | Escenarios Validados |
| :--- | :---: | :--- |
| `ReservaServiceTest` | 17 | Cotización previa con desglose, cálculo backend de `montoTotal`, prevención de manipulación de precios, creación en `PENDIENTE`/`PENDIENTE` con fecha de expiración, disponibilidad dinámica de reservas activas vs expiradas, solapamientos, fechas pasadas, exceso de capacidad, aislamiento por cliente y transiciones de estado. |
| `ReservaControllerSecurityTest` | 6 | Cotización pública (`POST /reservas/cotizar`), creación autenticada de reservas, extracción de `sub` desde JWT, restricción de listado global y cambio de estado a `ROLE_ADMIN`, 401 en peticiones anónimas. |
| `MesaServiceTest` | 5 | Listado de mesas disponibles con fechas válidas e invertidas, detección de duplicidad de número de mesa en creación y actualización, baja lógica. |
| `MesaControllerSecurityTest` | 4 | Consulta pública de mesas (`GET /mesas/disponibles`), protección de creación y edición administrativa de mesas solo para `ROLE_ADMIN`, rechazo con 403 para `ROLE_CLIENTE`. |
| **Total** | **32** | **100% Exitoso (0 fallos, 0 errores, 0 omitidos)** |
