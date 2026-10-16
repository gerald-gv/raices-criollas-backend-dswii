package com.raicescriollas.reservas.config;

import java.time.Clock;
import java.time.ZoneId;
import java.util.TimeZone;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DateTimeConfig {

    public static final String RESTAURANT_ZONE_ID = "America/Lima";
    public static final ZoneId ZONE_LIMA = ZoneId.of(RESTAURANT_ZONE_ID);

    @PostConstruct
    public void setGlobalDefaultTimezone() {
        TimeZone.setDefault(TimeZone.getTimeZone(ZONE_LIMA));
    }

    @Bean
    public ZoneId restaurantZoneId() {
        return ZONE_LIMA;
    }

    @Bean
    public Clock clock() {
        return Clock.system(ZONE_LIMA);
    }
}
