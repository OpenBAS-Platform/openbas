package io.openbas.injectors.caldera.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.injectors.caldera.client.CalderaInjectorClient;
import io.openbas.injectors.caldera.client.model.*;
import io.openbas.injectors.caldera.model.Obfuscator;
import io.openbas.injectors.caldera.model.ResultStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.hc.client5.http.ClientProtocolException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.logging.Level;

import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
@Log
public class CalderaInjectorService {

    private final CalderaInjectorClient client;

    // -- ABILITIES --

    public List<Ability> abilities() {
        return this.client.abilities();
    }

    public void exploit(
            @NotBlank final String obfuscator,
            @NotBlank final String paw,
            @NotBlank final String abilityId) {
        this.client.exploit(obfuscator, paw, abilityId);
    }

    public List<Obfuscator> obfuscators() {
        return this.client.obfuscators();
    }

    public List<Agent> agents() {
        try {
            return this.client.agents().stream().toList();
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error getting the list of Caldera agents", e);
            return new ArrayList<>();
        }
    }

    // -- LINK --

    public ExploitResult exploitResult(
            @NotBlank final String paw,
            @NotBlank final String abilityId) throws RuntimeException {
        Agent agent = this.client.agent(paw, "links");
        // Take the last created
        Link agentLink = agent.getLinks()
                .stream()
                .filter((l) -> l.getAbility().getAbility_id().equals(abilityId))
                .max(Comparator.comparing(l -> Instant.parse(l.getDecide())))
                .orElseThrow(() -> new RuntimeException("Caldera fail to execute ability " + abilityId + " on paw " + paw));
        assert paw.equals(agentLink.getPaw());
        ExploitResult exploitResult = new ExploitResult();
        exploitResult.setLinkId(agentLink.getId());
        byte[] decodedBytes = Base64.getDecoder().decode(agentLink.getCommand());
        exploitResult.setCommand(new String(decodedBytes, StandardCharsets.UTF_8));
        return exploitResult;
    }

    public ResultStatus results(@NotBlank final String linkId) {
        ResultStatus resultStatus = new ResultStatus();
        Result result = this.client.results(linkId);
        // No result or not finish -> in progress #see caldera code
        if (Optional.ofNullable(result).map(Result::getLink).map(Link::getFinish).isEmpty()) {
            resultStatus.setComplete(false);
        } else {
            resultStatus.setComplete(true);
            Link resultLink = result.getLink();
            resultStatus.setPaw(resultLink.getPaw());
            resultStatus.setFinish(Instant.parse(resultLink.getFinish()));
            // Status == 0 -> success || Status > 0 -> failed #see caldera code
            resultStatus.setFail(resultLink.getStatus() > 0);

            // Result output can be : #see caldera code
            //    - empty if ability execution return nothing
            //    - json object with stdout & stderr if ability execution return something
            String resultOutput = result.getOutput();
            byte[] decodedBytes = Base64.getDecoder().decode(resultOutput);
            String decodedString = new String(decodedBytes, StandardCharsets.UTF_8);
            resultStatus.setContent(hasText(decodedString) ? decodedString : "no output to show");
        }
        return resultStatus;
    }

}
