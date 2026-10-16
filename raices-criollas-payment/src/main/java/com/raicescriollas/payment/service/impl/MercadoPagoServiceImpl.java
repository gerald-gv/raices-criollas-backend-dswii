package com.raicescriollas.payment.service.impl;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.net.MPResultsResourcesPage;
import com.mercadopago.net.MPSearchRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.raicescriollas.payment.dto.PagoMP;
import com.raicescriollas.payment.dto.PreferenciaCreada;
import com.raicescriollas.payment.entity.Pago;
import com.raicescriollas.payment.exception.PasarelaPagoException;
import com.raicescriollas.payment.service.IMercadoPagoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class MercadoPagoServiceImpl implements IMercadoPagoService {

    @Value("${app.mercadopago.frontend-url}")
    private String frontendUrl;

    @Value("${app.mercadopago.public-url:}")
    private String publicUrl;

    @Override
    public PreferenciaCreada crearPreferencia(Pago pago) {
        try {
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .id(String.valueOf(pago.getPedidoId()))
                    .title("Pedido #" + pago.getPedidoId() + " - Raices Criollas")
                    .quantity(1)
                    .currencyId(pago.getMoneda())
                    .unitPrice(pago.getMonto())
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(frontendUrl + "/pago/exito")
                    .pending(frontendUrl + "/pago/pendiente")
                    .failure(frontendUrl + "/pago/error")
                    .build();

            String notificationUrl = publicUrl.isBlank()
                    ? null
                    : publicUrl + "/webhooks/mercadopago?source_news=webhooks";

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .externalReference(pago.getReferenciaExterna())
                    .notificationUrl(notificationUrl)
                    .build();

            Preference preference = new PreferenceClient().create(request);

            log.info("Preferencia {} creada para el pago {} con notification_url = {}",
                    preference.getId(), pago.getId(),
                    notificationUrl == null ? "(vacia)" : notificationUrl);

            return new PreferenciaCreada(preference.getId(), preference.getInitPoint());

        } catch (MPApiException e) {
            log.error("Mercado Pago rechazo la preferencia. Estado: {} - Respuesta: {}",
                    e.getStatusCode(), e.getApiResponse().getContent());
            throw new PasarelaPagoException();
        } catch (MPException e) {
            log.error("Error al comunicarse con Mercado Pago", e);
            throw new PasarelaPagoException();
        }
    }

    @Override
    public Optional<PagoMP> consultarPago(Long mpPaymentId) {
        try {
            Payment payment = new PaymentClient().get(mpPaymentId);

            return Optional.of(new PagoMP(
                    String.valueOf(payment.getId()),
                    payment.getStatus(),
                    payment.getExternalReference(),
                    payment.getTransactionAmount(),
                    payment.getResponse().getContent()
            ));
        } catch (MPApiException e) {
            if (e.getStatusCode() == 404) {
                log.warn("Mercado Pago no conoce el pago {}", mpPaymentId);
                return Optional.empty();
            }
            log.error("Error al consultar el pago {}. Estado: {} - Respuesta: {}",
                    mpPaymentId, e.getStatusCode(), e.getApiResponse().getContent());
            throw new PasarelaPagoException();
        } catch (MPException e) {
            log.error("Error al comunicarse con Mercado Pago", e);
            throw new PasarelaPagoException();
        }
    }

    @Override
    public List<Long> buscarIdsDePagos(String externalReference) {
        try {
            Map<String, Object> filtros = new HashMap<>();
            filtros.put("external_reference", externalReference);
            filtros.put("sort", "date_created");
            filtros.put("criteria", "asc");

            MPSearchRequest busqueda = MPSearchRequest.builder()
                    .offset(0)
                    .limit(30)
                    .filters(filtros)
                    .build();

            MPResultsResourcesPage<Payment> pagina = new PaymentClient().search(busqueda);

            return pagina.getResults().stream().map(Payment::getId).toList();

        } catch (MPApiException e) {
            log.error("Error al buscar pagos con la referencia {}. Estado: {} - Respuesta: {}",
                    externalReference, e.getStatusCode(), e.getApiResponse().getContent());
            throw new PasarelaPagoException();
        } catch (MPException e) {
            log.error("Error al comunicarse con Mercado Pago", e);
            throw new PasarelaPagoException();
        }
    }
}
