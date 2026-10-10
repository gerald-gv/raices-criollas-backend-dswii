# Especificación Técnica para la Integración del Frontend: Módulo de Reservas

**Proyecto:** Raíces Criollas — Backend Microservicios  
**Microservicio:** `raices-criollas-reservas`  
**Punto de Entrada (API Gateway):** `http://localhost:8080/api/reservas`  
**Puerto Directo del Microservicio:** `http://localhost:8083`  
**CORS Autorizado en Gateway:** `http://localhost:3000`  

---

## 1. Inspección del Workspace y Estado del Frontend

Tras inspeccionar la raíz del repositorio `raices-criollas-backend-dswii`, se constata que:
* El workspace contiene exclusivamente los proyectos backend Java/Spring Boot: `raices-criollas-auth`, `raices-criollas-eureka`, `raices-criollas-gateway`, `raices-criollas-menu` y `raices-criollas-reservas`.
* **No existe un proyecto frontend dentro de este workspace** (el Gateway está configurado con `allowedOrigins: "http://localhost:3000"`, preparado para una aplicación SPA / SSR en React, Next.js, Angular o Vue).
* Por tanto, esta especificación proporciona los contratos de datos, tipos TypeScript, cliente HTTP, flujos de autenticación JWT y especificación de pantallas listos para ser implementados en la aplicación frontend del restaurante.

---

## 2. Mapa Completo de Endpoints Reales del Backend

Dado que el API Gateway aplica el filtro `StripPrefix=2` sobre `/api/reservas/**`, las solicitudes dirigidas a `http://localhost:8080/api/reservas/<recurso>` se transfieren limpias a `http://localhost:8083/<recurso>`.

### 2.1. Endpoints de Mesas (`/mesas`)

| Método | URL Gateway (`:8080`) | Ruta Interna (`:8083`) | Acceso / Rol | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/reservas/mesas/disponibles` | `/mesas/disponibles` | **Público** (`permitAll`) | Consulta mesas libres para un horario y cantidad de comensales. |
| `POST` | `/api/reservas/mesas` | `/mesas` | `ROLE_ADMIN` | Registra una nueva mesa en el catálogo. |
| `GET` | `/api/reservas/mesas` | `/mesas` | `ROLE_ADMIN` | Listado general de todas las mesas para administración. |
| `GET` | `/api/reservas/mesas/{id}` | `/mesas/{id}` | `ROLE_ADMIN`, `ROLE_CLIENTE` | Obtiene el detalle de una mesa por ID. |
| `PUT` | `/api/reservas/mesas/{id}` | `/mesas/{id}` | `ROLE_ADMIN` | Actualiza número, capacidad y ubicación de una mesa. |
| `PATCH` | `/api/reservas/mesas/{id}/estado` | `/mesas/{id}/estado` | `ROLE_ADMIN` | Activa o desactiva una mesa (disponibilidad operativa). |

### 2.2. Endpoints de Reservas (`/reservas`)

| Método | URL Gateway (`:8080`) | Ruta Interna (`:8083`) | Acceso / Rol | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/reservas/reservas` | `/reservas` | `ROLE_CLIENTE`, `ROLE_ADMIN` | Crea una reserva para el usuario autenticado (extrae `sub` del JWT). |
| `GET` | `/api/reservas/reservas/mis-reservas` | `/reservas/mis-reservas` | `ROLE_CLIENTE`, `ROLE_ADMIN` | Lista las reservas del cliente autenticado. |
| `GET` | `/api/reservas/reservas/mis-reservas/{id}` | `/reservas/mis-reservas/{id}` | `ROLE_CLIENTE`, `ROLE_ADMIN` | Detalle de reserva propia (403 si pertenece a otro cliente). |
| `PATCH` | `/api/reservas/reservas/{id}/cancelar` | `/reservas/{id}/cancelar` | `ROLE_CLIENTE`, `ROLE_ADMIN` | Cancela una reserva propia antes de su inicio. |
| `GET` | `/api/reservas/reservas` | `/reservas` | `ROLE_ADMIN` | Consulta todas las reservas del restaurante con filtros. |
| `GET` | `/api/reservas/reservas/{id}` | `/reservas/{id}` | `ROLE_ADMIN`, `ROLE_CLIENTE` | Detalle de reserva (ADMIN ve cualquiera; CLIENTE solo la suya). |
| `PATCH` | `/api/reservas/reservas/{id}/estado` | `/reservas/{id}/estado` | `ROLE_ADMIN` | Modifica el estado de una reserva (CONFIRMADA, CANCELADA, etc.). |

---

## 3. Formato Estándar de Respuesta: `ApiResponse<T>`

Todas las respuestas del microservicio (tanto exitosas como de error) siguen la estructura:

```json
{
  "success": true,
  "mensaje": "Mensaje descriptivo del resultado de la operación",
  "data": { ... }
}
```

### Convención de Códigos HTTP del Backend:
* `200 OK`: Consulta o actualización procesada exitosamente.
* `201 Created`: Creación de recurso exitosa (`POST /mesas`, `POST /reservas`).
* `400 Bad Request`: Error de validación en los campos (`@Valid`). En este caso, `data` contiene un mapa clave-valor con cada campo y su mensaje de error.
* `401 Unauthorized`: Token ausente, expirado o con firma inválida.
* `403 Forbidden`: Token válido pero el usuario no posee el rol necesario (`ROLE_ADMIN`) o intenta acceder a la reserva de otro cliente.
* `404 Not Found`: Mesa o reserva no encontrada con el ID solicitado.
* `409 Conflict`: Regla de negocio infringida (mesa ocupada por solapamiento, mesa inactiva, capacidad superada, reserva ya cancelada).
* `500 Internal Server Error`: Error inesperado del servidor (con mensaje genérico seguro sin trazas SQL ni secretos).

---

## 4. Integración con el Sistema de Autenticación (JWT)

### 4.1. Flujo de Autenticación
1. El usuario inicia sesión a través del Gateway contra el microservicio Auth:
   * **URL:** `POST http://localhost:8080/api/auth/login`
   * **Body:** `{ "email": "usuario@ejemplo.com", "password": "mipassword" }`
   * **Respuesta de Auth:**
     ```json
     {
       "success": true,
       "mensaje": "Inicio de sesion exitoso",
       "data": {
         "accessToken": "eyJhbGciOiJIUzI1NiJ...",
         "tokenType": "Bearer",
         "expiresIn": 7200
       }
     }
     ```
2. El frontend almacena el `accessToken` (en `localStorage` o cookie de sesión según la arquitectura del cliente).
3. En cada solicitud protegida a Reservas, el frontend debe adjuntar la cabecera:
   ```http
   Authorization: Bearer <accessToken>
   ```

> [!WARNING]
> **REGLA DE SEGURIDAD CRÍTICA:**
> * **El frontend NUNCA debe enviar un `userId` ni `clienteId` en el body o parámetros para crear o consultar reservas.**
> * El backend extrae el ID del cliente exclusivamente a partir del claim `sub` del token JWT validado criptográficamente.
> * El frontend nunca debe almacenar ni manejar la variable `JWT_SECRET`. La firma y verificación del token es exclusiva de los microservicios backend.

---

## 5. Modelos de Datos e Interfaces TypeScript

Cree el archivo `src/types/reservas.types.ts` en el proyecto frontend:

```typescript
// =============================================================================
// ENUMS Y TIPOS BASE
// =============================================================================

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export interface ApiResponse<T> {
  success: boolean;
  mensaje: string;
  data: T;
}

// =============================================================================
// MESAS
// =============================================================================

export interface Mesa {
  id: number;
  numeroMesa: string;
  capacidad: number;
  ubicacion?: string;
  activo: boolean;
}

export interface MesaRequestDTO {
  numeroMesa: string;
  capacidad: number;
  ubicacion?: string;
  activo?: boolean;
}

export interface MesaEstadoRequestDTO {
  activo: boolean;
}

// =============================================================================
// RESERVAS
// =============================================================================

export interface Reserva {
  id: number;
  clienteId: number;
  mesa: Mesa;
  fechaInicio: string; // ISO 8601: "YYYY-MM-DDTHH:mm:ss"
  fechaFin: string;    // ISO 8601: "YYYY-MM-DDTHH:mm:ss"
  cantidadPersonas: number;
  estado: EstadoReserva;
  observaciones?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface ReservaRequestDTO {
  mesaId: number;
  fechaInicio: string; // Formato requerido: "2026-10-15T13:00:00"
  fechaFin: string;    // Formato requerido: "2026-10-15T15:00:00"
  cantidadPersonas: number;
  observaciones?: string;
}

export interface ActualizarEstadoReservaDTO {
  estado: EstadoReserva;
}

// =============================================================================
// FILTROS DE CONSULTA
// =============================================================================

export interface FiltroDisponibilidad {
  fechaInicio: string;
  fechaFin: string;
  cantidadPersonas: number;
}

export interface FiltroReservasAdmin {
  mesaId?: number;
  estado?: EstadoReserva;
  desde?: string;
  hasta?: string;
}
```

---

## 6. Cliente HTTP API en TypeScript (Axios)

Cree el archivo `src/services/reservas.service.ts`:

```typescript
import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  Mesa,
  MesaRequestDTO,
  MesaEstadoRequestDTO,
  Reserva,
  ReservaRequestDTO,
  ActualizarEstadoReservaDTO,
  FiltroDisponibilidad,
  FiltroReservasAdmin,
} from '../types/reservas.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080/api/reservas';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo global de 401 y 403
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<any>>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// SERVICIOS PÚBLICOS Y DE CLIENTE
// =============================================================================

/**
 * 1. Consulta pública de mesas disponibles por fecha, horario y comensales.
 * No requiere autenticación.
 */
export async function consultarMesasDisponibles(filtro: FiltroDisponibilidad): Promise<Mesa[]> {
  const { data } = await api.get<ApiResponse<Mesa[]>>('/mesas/disponibles', {
    params: {
      fechaInicio: filtro.fechaInicio,
      fechaFin: filtro.fechaFin,
      cantidadPersonas: filtro.cantidadPersonas,
    },
  });
  return data.data;
}

/**
 * 2. Crea una reserva para el cliente autenticado.
 * Requiere token JWT. No envía clienteId (el backend lo extrae de "sub").
 */
export async function crearReserva(dto: ReservaRequestDTO): Promise<Reserva> {
  const { data } = await api.post<ApiResponse<Reserva>>('/reservas', dto);
  return data.data;
}

/**
 * 3. Consulta el historial de reservas del cliente autenticado.
 */
export async function obtenerMisReservas(): Promise<Reserva[]> {
  const { data } = await api.get<ApiResponse<Reserva[]>>('/reservas/mis-reservas');
  return data.data;
}

/**
 * 4. Obtiene el detalle de una reserva propia.
 */
export async function obtenerMiReserva(id: number): Promise<Reserva> {
  const { data } = await api.get<ApiResponse<Reserva>>(`/reservas/mis-reservas/${id}`);
  return data.data;
}

/**
 * 5. Cancela una reserva propia antes de que inicie.
 */
export async function cancelarReserva(id: number): Promise<Reserva> {
  const { data } = await api.patch<ApiResponse<Reserva>>(`/reservas/${id}/cancelar`);
  return data.data;
}

// =============================================================================
// SERVICIOS ADMINISTRATIVOS (Requieren ROLE_ADMIN)
// =============================================================================

export async function listarMesasAdmin(): Promise<Mesa[]> {
  const { data } = await api.get<ApiResponse<Mesa[]>>('/mesas');
  return data.data;
}

export async function crearMesa(dto: MesaRequestDTO): Promise<Mesa> {
  const { data } = await api.post<ApiResponse<Mesa>>('/mesas', dto);
  return data.data;
}

export async function actualizarMesa(id: number, dto: MesaRequestDTO): Promise<Mesa> {
  const { data } = await api.put<ApiResponse<Mesa>>(`/mesas/${id}`, dto);
  return data.data;
}

export async function cambiarEstadoMesa(id: number, activo: boolean): Promise<Mesa> {
  const { data } = await api.patch<ApiResponse<Mesa>>(`/mesas/${id}/estado`, { activo });
  return data.data;
}

export async function listarReservasAdmin(filtros?: FiltroReservasAdmin): Promise<Reserva[]> {
  const { data } = await api.get<ApiResponse<Reserva[]>>('/reservas', {
    params: filtros,
  });
  return data.data;
}

export async function cambiarEstadoReserva(id: number, dto: ActualizarEstadoReservaDTO): Promise<Reserva> {
  const { data } = await api.patch<ApiResponse<Reserva>>(`/reservas/${id}/estado`, dto);
  return data.data;
}
```

---

## 7. Especificación Detallada de Pantallas y Experiencia de Usuario

### Pantalla A: Consulta Pública de Disponibilidad
* **Objetivo:** Permitir al usuario explorar la disponibilidad de mesas en el restaurante sin obligarlo a iniciar sesión previamente.
* **Componentes de Entrada:**
  * Selector de Fecha: Mínimo la fecha de hoy (`min={today}`).
  * Hora de Inicio y Hora de Fin (o selector de turno: Almuerzo 13:00 - 15:00 / Cena 20:00 - 22:00).
  * Contador de Comensales: Valor entero $\ge 1$.
* **Validaciones en Frontend:**
  * `fechaInicio` debe ser estrictamente posterior al momento actual.
  * `fechaFin` debe ser posterior a `fechaInicio` (duración mínima recomendada: 1 hora).
  * Cantidad de personas $> 0$.
* **Estados de la Interfaz:**
  * *Estado Inicial:* Formulario de búsqueda limpio.
  * *Cargando (Loading):* Skeleton cards o spinner mientras el backend evalúa solapamientos.
  * *Sin Resultados:* Mensaje informativo "No hay mesas disponibles para el horario y capacidad seleccionada. Pruebe otro horario o divida su grupo".
  * *Resultados Disponibles:* Tarjetas de mesas con:
    * Código (ej. `M-01`).
    * Capacidad máxima (ej. `Hasta 4 personas`).
    * Ubicación (ej. `Terraza Exterior - Jardín`).
    * Botón "Seleccionar Mesa".

---

### Pantalla B: Confirmación y Creación de Reserva
* **Flujo de Usuario:**
  1. Al hacer clic en "Seleccionar Mesa", el frontend verifica si existe un token JWT válido:
     * Si el usuario **no está autenticado**, almacena temporalmente la selección en memoria o `sessionStorage` y lo redirige a `/login?redirect=/reservar`.
     * Si **ya está autenticado**, abre el modal o paso final de confirmación.
  2. Muestra un resumen de la reserva:
     * Mesa seleccionada, capacidad, sector.
     * Fecha y rango de horario pactado.
     * Cantidad de personas.
     * Campo opcional: "Observaciones / Solicitudes especiales" (máximo 500 caracteres).
  3. Al presionar "Confirmar Reserva", llama a `POST /api/reservas/reservas`.
* **Manejo de Errores Críticos:**
  * **HTTP 409 (Conflict):** La mesa fue ocupada en ese intervalo por otra persona mientras el usuario confirmaba. La UI muestra una alerta: *"La mesa seleccionada ya no está disponible en este horario. Por favor seleccione otra mesa disponible"* y actualiza el listado.
  * **HTTP 400 (Bad Request):** Datos no válidos; muestra los mensajes específicos devueltos en `data`.

---

### Pantalla C: Historial de "Mis Reservas"
* **Ruta Frontend:** `/mis-reservas` (Protegida por guardián de autenticación).
* **Flujo:**
  * Al montar el componente, invoca `GET /api/reservas/reservas/mis-reservas`.
  * Muestra una tabla o tarjetas con:
    * Código de mesa y ubicación.
    * Fecha y rango horario (formateado en zona horaria local).
    * Cantidad de comensales.
    * Badge de estado con código de color:
      * `CONFIRMADA`: Verde
      * `PENDIENTE`: Amarillo
      * `CANCELADA`: Gris
      * `COMPLETADA`: Azul
    * Botón "Cancelar Reserva": Habilitado únicamente si el estado es `CONFIRMADA` o `PENDIENTE` y la fecha de inicio es futura.
* **Modal de Confirmación de Cancelación:**
  * Advierte: *"¿Está seguro de que desea cancelar su reserva para el [Fecha] en la mesa [Número]?"*
  * Al confirmar, ejecuta `PATCH /api/reservas/reservas/{id}/cancelar`.
  * Tras recibir `success: true`, actualiza reactivamente el estado en el listado a `CANCELADA`.

---

### Pantalla D: Administración de Mesas (`ROLE_ADMIN`)
* **Ruta Frontend:** `/admin/mesas`
* **Funcionalidades:**
  * Tabla con todas las mesas físicas del restaurante (`GET /api/reservas/mesas`).
  * Botón superior: "Nueva Mesa" (Abre modal con formulario `MesaRequestDTO`).
  * En cada fila:
    * Botón "Editar" (Modifica número, capacidad y ubicación mediante `PUT /api/reservas/mesas/{id}`).
    * Switch o botón "Activar/Desactivar":
      * Llama a `PATCH /api/reservas/mesas/{id}/estado` con `{ activo: !actual }`.
  * **Manejo de Error 409:** Si el administrador ingresa un número de mesa que ya existe, muestra un toast/alerta: *"Ya existe una mesa registrada con ese número"*.

---

### Pantalla E: Administración General de Reservas (`ROLE_ADMIN`)
* **Ruta Frontend:** `/admin/reservas`
* **Filtros Avanzados en la Barra Superior:**
  * Filtro por Estado: Dropdown (`TODOS`, `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`).
  * Filtro por Mesa: Selector de mesas activas.
  * Rango de Fechas: `Desde` y `Hasta`.
* **Tabla de Resultados:**
  * Columnas: `ID`, `ID Cliente`, `Mesa`, `Horario`, `Personas`, `Estado`, `Acciones`.
  * Botón de Acción: "Cambiar Estado" -> Modal para seleccionar nuevo estado y guardar mediante `PATCH /api/reservas/reservas/{id}/estado`.

---

## 8. Ejemplos de Solicitudes y Respuestas para Pruebas (Postman / Frontend)

### 8.1. Consultar Mesas Disponibles (Público)
* **Método:** `GET`
* **URL:** `http://localhost:8080/api/reservas/mesas/disponibles?fechaInicio=2026-10-15T13:00:00&fechaFin=2026-10-15T15:00:00&cantidadPersonas=4`
* **Cabeceras:** Ninguna requerida.
* **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "mensaje": "Mesas disponibles consultadas exitosamente",
  "data": [
    {
      "id": 3,
      "numeroMesa": "M-03",
      "capacidad": 4,
      "ubicacion": "Salón Principal - Esquina Romántica",
      "activo": true
    },
    {
      "id": 4,
      "numeroMesa": "M-04",
      "capacidad": 4,
      "ubicacion": "Salón Principal - Zona Central",
      "activo": true
    }
  ]
}
```

### 8.2. Crear Reserva (Cliente Autenticado)
* **Método:** `POST`
* **URL:** `http://localhost:8080/api/reservas/reservas`
* **Cabeceras:**
  * `Content-Type: application/json`
  * `Authorization: Bearer <TOKEN_JWT_CLIENTE>`
* **Cuerpo de la Petición:**
```json
{
  "mesaId": 3,
  "fechaInicio": "2026-10-15T13:00:00",
  "fechaFin": "2026-10-15T15:00:00",
  "cantidadPersonas": 4,
  "observaciones": "Mesa junto a la ventana si es posible"
}
```
* **Respuesta Exitosa (201 Created):**
```json
{
  "success": true,
  "mensaje": "Reserva creada exitosamente",
  "data": {
    "id": 1,
    "clienteId": 10,
    "mesa": {
      "id": 3,
      "numeroMesa": "M-03",
      "capacidad": 4,
      "ubicacion": "Salón Principal - Esquina Romántica",
      "activo": true
    },
    "fechaInicio": "2026-10-15T13:00:00",
    "fechaFin": "2026-10-15T15:00:00",
    "cantidadPersonas": 4,
    "estado": "CONFIRMADA",
    "observaciones": "Mesa junto a la ventana si es posible",
    "fechaCreacion": "2026-10-10T03:30:00",
    "fechaActualizacion": null
  }
}
```

### 8.3. Error de Conflicto de Disponibilidad (409 Conflict)
* **Condición:** Se intenta reservar una mesa que ya tiene una reserva solapada.
* **Respuesta (409 Conflict):**
```json
{
  "success": false,
  "mensaje": "La mesa no está disponible para el intervalo de tiempo seleccionado",
  "data": null
}
```

### 8.4. Error de Capacidad Superada (409 Conflict)
* **Condición:** Se solicitan 6 personas en una mesa de capacidad 4.
* **Respuesta (409 Conflict):**
```json
{
  "success": false,
  "mensaje": "La cantidad de personas (6) supera la capacidad máxima de la mesa (4)",
  "data": null
}
```

### 8.5. Acceso Denegado a Recurso Ajeno (403 Forbidden)
* **Condición:** El cliente con `sub=10` intenta consultar o cancelar `GET /api/reservas/reservas/mis-reservas/99` perteneciente a otro cliente (`sub=25`).
* **Respuesta (403 Forbidden):**
```json
{
  "success": false,
  "mensaje": "No tiene permisos para acceder a este recurso",
  "data": null
}
```

---

## 9. Tareas Pendientes para el Desarrollo del Frontend

Cuando el equipo proceda a codificar la aplicación cliente en su repositorio:
1. **Instalación de Cliente HTTP:** Configurar Axios o Fetch con el interceptor para inyectar `Authorization: Bearer <token>`.
2. **Creación de Componentes de Reserva:**
   * `ReservaDisponibilidadForm`: Filtros de fecha, hora y comensales.
   * `MesaGrid`: Cuadrícula interactiva de mesas libres.
   * `ReservaConfirmModal`: Resumen y campo de observaciones.
3. **Página de Usuario:** `MisReservasView` con tabla de historial y botón de cancelación.
4. **Vistas Administrativas:**
   * `AdminMesasView`: Catálogo de mesas físicas y switch activo/inactivo.
   * `AdminReservasView`: Panel de control general con filtros y cambio de estado.
5. **Configuración de Variables de Entorno del Frontend:**
   * `NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080/api/reservas` (o variable equivalente según el framework elegido).
