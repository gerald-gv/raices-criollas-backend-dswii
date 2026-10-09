package com.raicescriollas.menu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class MenuServicesApplication {

	public static void main(String[] args) {
		SpringApplication.run(MenuServicesApplication.class, args);
	}

}
