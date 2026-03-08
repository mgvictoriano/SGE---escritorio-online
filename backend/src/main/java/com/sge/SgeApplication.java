package com.sge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgeApplication.class, args);
    }
}
