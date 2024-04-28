package io.openbas.injectors.caldera;

import io.openbas.database.model.Endpoint;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.integrations.InjectorService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.logging.Level;

@Component
@Log
public class CalderaInjector {

    private static final String CALDERA_INJECTOR_NAME = "Caldera";

    @Autowired
    public CalderaInjector(InjectorService injectorService, CalderaContract contract, CalderaInjectorConfig calderaInjectorConfig) {
        try {
            injectorService.register(
                    calderaInjectorConfig.getId(),
                    CALDERA_INJECTOR_NAME,
                    contract,
                    false,
                    true,
                    new String[]{Endpoint.PLATFORM_TYPE.Windows.name(), Endpoint.PLATFORM_TYPE.Linux.name(), Endpoint.PLATFORM_TYPE.MacOS.name()},
                    "simulation-agent"
            );
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating caldera injector");
        }
    }
}
