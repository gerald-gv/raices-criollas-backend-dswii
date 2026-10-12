package com.raicescriollas.pedidos.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

//Limpieza periodica: cancela pedidos que nadie pago y borra carritos abandonados.
//Los plazos se cambian en application.yml (app.expiracion.*).
@Component
public class ExpiracionJob {

	private static final Logger log = LoggerFactory.getLogger(ExpiracionJob.class);

	private final PedidosService service;
	private final long pedidoPendienteMinutos;
	private final long carritoDias;

	public ExpiracionJob(PedidosService service,
			@Value("${app.expiracion.pedido-pendiente-minutos:30}") long pedidoPendienteMinutos,
			@Value("${app.expiracion.carrito-dias:7}") long carritoDias) {
		this.service = service;
		this.pedidoPendienteMinutos = pedidoPendienteMinutos;
		this.carritoDias = carritoDias;
	}

	@Scheduled(fixedDelayString = "${app.expiracion.intervalo-ms:300000}")
	public void limpiar() {
		try {
			LocalDateTime ahora = LocalDateTime.now();
			int pedidos = service.expirarPedidosPendientes(ahora.minusMinutes(pedidoPendienteMinutos));
			int carritos = service.expirarCarritos(ahora.minusDays(carritoDias));

			if (pedidos > 0 || carritos > 0)
				log.info("Expiracion: {} pedidos pendientes cancelados, {} carritos borrados", pedidos, carritos);
		} catch (RuntimeException e) {
			log.warn("No se pudo ejecutar la limpieza de pedidos y carritos", e);
		}
	}
}
