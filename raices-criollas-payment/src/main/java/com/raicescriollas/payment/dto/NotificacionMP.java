package com.raicescriollas.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

public record NotificacionMP(String type, String action, Data data) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(String id) {
    }
}
