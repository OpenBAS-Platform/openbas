package io.openbas.injects.email;

import io.openbas.service.InjectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EmailInjector {

    private static final String EMAIL_INJECTOR_NAME = "Email injector";
    private static final String EMAIL_INJECTOR_ID = "b031c355-7599-4cb8-99d5-f99e0e1936a3";

    @Autowired
    public EmailInjector(InjectorService injectorService, EmailContract contract) {
        try {
            injectorService.register(EMAIL_INJECTOR_ID, EMAIL_INJECTOR_NAME, contract);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
