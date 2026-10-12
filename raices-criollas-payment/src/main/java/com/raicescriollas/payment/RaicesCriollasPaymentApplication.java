package com.raicescriollas.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RaicesCriollasPaymentApplication {

    public static void main(String[] args) {
        SpringApplication.run(RaicesCriollasPaymentApplication.class, args);
    }

}
