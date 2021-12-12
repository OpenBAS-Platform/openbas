package io.openex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class App {

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    /*
        Remaining stuff
        - Kerberos authentication
        - Testing / implementing comcheck
        - Exercise export in Excel
        - Create an exercise test (Is Fake data provisioning?)
        - Copy one audience to an exercise
        - Complete exercise statistics
        - Change the duration of an exercise (ScenarioPopover.js)
        - Various CRUD API.
     */
}
