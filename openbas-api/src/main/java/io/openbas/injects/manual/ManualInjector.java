package io.openbas.injects.manual;

import io.openbas.asset.InjectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ManualInjector {

    private static final String MANUAL_INJECTOR_NAME = "Manual injector";
    private static final String MANUAL_INJECTOR_ID = "6981a39d-e219-4016-a235-cf7747994abc";

    @Autowired
    public ManualInjector(InjectorService injectorService, ManualContract contract) {
        try {
            injectorService.register(MANUAL_INJECTOR_ID, MANUAL_INJECTOR_NAME, contract);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
