package com.raicescriollas.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TokenResponse(
        @JsonProperty("accessToken") String accessToken,
        @JsonProperty("tokenType")   String tokenType,
        @JsonProperty("expiresIn")   long expiresIn) {
}
