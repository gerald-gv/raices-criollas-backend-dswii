Integración RabbitMQ — raices-criollas-pedidos + raices-criollas-menu

Esta integración añade mensajería asíncrona con RabbitMQ entre `pedidos-service` y `menu-service` para gestionar el stock de forma desacoplada. RabbitMQ es el único canal para el descuento y reposición de stock — no se usa Feign REST para estas operaciones.

Infraestructura RabbitMQ, para levantar el broker (Docker)

docker run -d --hostname rabbit-host --name rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=raices_user -e RABBITMQ_DEFAULT_PASS=RaicesLocal2026! rabbitmq:4-management

Panel de administración: http://localhost:15672

Para reiniciar el contenedor sin recrearlo es este codigo:
docker start rabbitmq


Variables de entorno requeridas en pedidos-service y menu-service:

RABBITMQ_USER: raices_user
 RABBITMQ_PASSWORD: RaicesLocal2026!

Contrato del evento (JSON)

Ambos microservicios usan su propia clase `PedidoPagadoEvent` — no comparten código Java.
El contrato es el esquema JSON:

{
  "pedidoId": 42,
  "clienteId": 7,
  "items": [
    { "platoId": 1, "cantidad": 2 },
    { "platoId": 3, "cantidad": 1 }
  ]
}
Flujo completo de prueba

Puertos de los servicios

### Paso 1 — Obtener token de usuario (ROLE_USER)
POST http://localhost:8081/auth/login
Content-Type: application/json
POST	http://localhost:8080/api/auth/login
{
  "email": "usuario@email.com",
  "password": "contraseña"
}

Paso 2 — Obtener token de servicio (ROLE_SERVICE)
POST	http://localhost:8080/api/auth-internal/service-token
Content-Type: application/json
{
  "serviceName": "pedidos-service",
  "secret": "antiCibertec"
}

Guardarlo.


Paso 3 — Verificar stock del plato(solo si tienes admin, si no es opcional)

GET http://localhost:8080/api/menu/platos/{id}
Anotar el valor de `stock` antes de la prueba.

Paso 4 - Vaciamos el carro por si acaso

DELETE	http://localhost:8080/api/pedidos/carrito
Recuerda poner tu token de usuario

Paso 5 — Agregar plato al carrito

POST http://localhost:8080/api/pedidos/carrito/items
Authorization: Bearer TOKEN_USER
Content-Type: application/json

{
  "platoId": 6,
  "cantidad": 2
}


Paso 6 — Confirmar pedido (pasa a PENDIENTE_PAGO)

POST http://localhost:8080/api/pedidos/carrito/confirmar
Authorization: Bearer TOKEN_USER

La respuesta incluye el `id` del pedido. Guardarlo como PEDIDO_ID, ejemplo de la respuesta de postman.
{
    "success": true,
    "mensaje": "Pedido registrado",
    "data": {
        "id": 7,
        "clienteId": 3,
        "fecha": "2026-10-12T20:47:51.8987568",
        "estado": "PENDIENTE_PAGO",
        "total": 49.80,
        "detalles": [
            {
                "platoId": 6,
                "nombrePlato": "Pollo a la Brasa",
                "cantidad": 2,
                "precioUnitario": 24.90,
                "subtotal": 49.80
            }
        ]
    }
}

Paso 7 — Si quieres consultar tus pedidos

```
Get http://localhost:8080/api/pedidos/mis-pedidos
Recuerda meter tu token de usuario


Paso 8 — Marcar pedido como pagado ← dispara RabbitMQ

PUT http://localhost:8080/api/pedidos/interno/{{PEDIDO_ID}}/pagado

Authorization: Bearer TOKEN_SERVICE
Ejemplo:
{
    "success": true,
    "mensaje": "Pedido marcado como pagado",
    "data": {
        "id": 7,
        "clienteId": 3,
        "fecha": "2026-10-12T20:47:51.898757",
        "estado": "PAGADO",
        "total": 49.80,
        "detalles": [
            {
                "platoId": 6,
                "nombrePlato": "Pollo a la Brasa",
                "cantidad": 2,
                "precioUnitario": 24.90,
                "subtotal": 49.80
            }
        ]
    }
}
**Qué ocurre internamente:**
1. El pedido se guarda con estado `PAGADO`
2. El carrito del cliente se elimina automáticamente
3. `PedidoEventPublisher` publica el evento `pedido.pagado` en `raices.exchange`
4. `StockEventConsumer` en menu-service consume el mensaje y llama a `PlatoService.reducirStock()`

> El stock se descuenta **de forma asíncrona**: el endpoint responde inmediatamente y el descuento
> ocurre en cuanto menu-service procesa el mensaje (milisegundos en condiciones normales).


Paso 9 — Cancelar pedido pagado (dispara cola reponer)

PATCH http://localhost:8080/api/pedidos/admin/{{PEDIDO_ID}}/estado
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "estado": "CANCELADO"
}

Qué ocurre internamente:
1. `PedidoEventPublisher` publica `pedido.cancelado.pagado` en `raices.exchange`
2. `StockEventConsumer` consume de `menu.stock.reponer` y llama a `PlatoService.reponerStock()`

 Paso 10 - Si el cliente quiere cancelar puede hacerlo si esta pendiente de pago:

 PATCH http://localhost:8080/api/pedidos/{{PEDIDO_ID}}/cancelar