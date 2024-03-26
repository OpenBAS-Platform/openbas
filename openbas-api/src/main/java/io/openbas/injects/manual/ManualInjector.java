package io.openbas.injects.manual;

import io.openbas.service.InjectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ManualInjector {

    private static final String MANUAL_INJECTOR_NAME = "Manual injector";
    private static final String MANUAL_INJECTOR_ID = "b031c355-7599-4cb8-99d5-f99e0e1936a5";

    @Autowired
    public ManualInjector(InjectorService injectorService, ManualContract contract) {
        try {
            injectorService.register(MANUAL_INJECTOR_ID, MANUAL_INJECTOR_NAME, contract);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
