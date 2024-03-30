package io.openbas.injects.channel;

import io.openbas.asset.InjectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChannelInjector {

    private static final String CHANNEL_INJECTOR_NAME = "Channel injector";
    private static final String CHANNEL_INJECTOR_ID = "b031c355-7599-4cb8-99d5-f99e0e1936a6";

    @Autowired
    public ChannelInjector(InjectorService injectorService, ChannelContract contract) {
        try {
            injectorService.register(CHANNEL_INJECTOR_ID, CHANNEL_INJECTOR_NAME, contract);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
