package io.openbas.injects.opencti;

import io.openbas.service.InjectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OpenCTIInjector {

    private static final String OPENCTI_INJECTOR_NAME = "OpenCTI injector";
    private static final String OPENCTI_INJECTOR_ID = "b031c355-7599-4cb8-99d5-f99e0e1936a9";

    @Autowired
    public OpenCTIInjector(InjectorService injectorService, OpenCTIContract contract) {
        try {
            injectorService.register(OPENCTI_INJECTOR_ID, OPENCTI_INJECTOR_NAME, contract);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
