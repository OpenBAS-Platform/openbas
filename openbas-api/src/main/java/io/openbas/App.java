package io.openbas;

import io.openbas.tools.FlywayMigrationValidator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class App {

  public static void main(String[] args) {
    FlywayMigrationValidator.validateFlywayMigrationNames();
    SpringApplication.run(App.class, args);
  }
}
