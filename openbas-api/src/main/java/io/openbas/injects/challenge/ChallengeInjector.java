package io.openbas.injects.challenge;

import io.openbas.injects.channel.ChannelContract;
import io.openbas.service.InjectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChallengeInjector {

    private static final String CHALLENGE_INJECTOR_NAME = "Challenge injector";
    private static final String CHALLENGE_INJECTOR_ID = "b031c355-7599-4cb8-99d5-f99e0e1936a7";

    @Autowired
    public ChallengeInjector(InjectorService injectorService, ChallengeContract contract) {
        try {
            injectorService.register(CHALLENGE_INJECTOR_ID, CHALLENGE_INJECTOR_NAME, contract);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
