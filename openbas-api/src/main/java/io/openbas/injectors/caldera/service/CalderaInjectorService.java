package io.openbas.injectors.caldera.service;

import io.openbas.config.OpenBASAdminConfig;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import io.openbas.injectors.caldera.client.CalderaInjectorClient;
import io.openbas.injectors.caldera.client.model.*;
import io.openbas.injectors.caldera.model.Obfuscator;
import io.openbas.injectors.caldera.model.ResultStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Level;

import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
@Log
public class CalderaInjectorService {

    private final CalderaInjectorClient client;
    private final OpenBASConfig openBASConfig;
    private final OpenBASAdminConfig openBASAdminConfig;

    // -- ABILITIES --

    public List<Ability> abilities() {
        return this.client.abilities();
    }

    public Ability findAbilityById(String abilityId) {
        return this.client.findAbilityById(abilityId);
    }

    public String exploit(
            @NotBlank final String obfuscator,
            @NotBlank final String paw,
            @NotBlank final String abilityId,
            final List<Map<String, String>> additionalFields
    ) {
        return this.client.exploit(obfuscator, paw, abilityId, additionalFields);
    }

    public List<Obfuscator> obfuscators() {
        return this.client.obfuscators();
    }

    public void deleteAbility(Ability ability) {
        this.client.deleteAbility(ability);
    }

    public Ability createAbility(Payload payload) {
        List<Map<String, Object>> executors = new ArrayList<>();
        List<String> cleanupCommands = new ArrayList<>();
        if (payload.getCleanupCommand() != null) {
            cleanupCommands.add(payload.getCleanupCommand());
        }
        switch (payload.getType()) {
            case "Command":
                Command payloadCommand = (Command) Hibernate.unproxy(payload);
                Arrays.stream(payloadCommand.getPlatforms()).forEach(platform -> {
                    Map<String, Object> executor = new HashMap<>();
                    executor.put("platform", platform.equals(PLATFORM_TYPE.MacOS) ? "darwin" : platform.name().toLowerCase());
                    executor.put("name", payloadCommand.getExecutor().equals("bash") ? "sh" : payloadCommand.getExecutor());
                    executor.put("command", payloadCommand.getContent());
                    executor.put("cleanup", cleanupCommands);
                    executors.add(executor);
                });
                break;
            case "Executable":
                Executable payloadExecutable = (Executable) Hibernate.unproxy(payload);
                Arrays.stream(payloadExecutable.getPlatforms()).forEach(platform -> {
                    Map<String, Object> executor = new HashMap<>();
                    executor.put("platform", platform.equals(PLATFORM_TYPE.MacOS) ? "darwin" : platform.name().toLowerCase());
                    executor.put("name", platform.equals(PLATFORM_TYPE.Windows.name()) ? "psh" : "sh");
                    String windowsCommand = "Invoke-WebRequest -Method GET -Uri " + openBASConfig.getBaseUrl() + "/api/documents/" + payloadExecutable.getExecutableFile().getId() + "/file -Headers @{'Authorization' = 'Bearer " + openBASAdminConfig.getToken() + "'} -OutFile " + payloadExecutable.getExecutableFile().getName() + "; " + payloadExecutable.getExecutableFile().getName() + ";";
                    String unixCommand = "curl -H \"Authorization: Bearer " + openBASAdminConfig.getToken() + "\" " + openBASConfig.getBaseUrl() + "/api/documents/" + payloadExecutable.getExecutableFile().getId() + "/file -o " + payloadExecutable.getExecutableFile().getName() + ";./" + payloadExecutable.getExecutableFile().getName() + ";";
                    executor.put("command", platform.equals(PLATFORM_TYPE.Windows.name()) ? windowsCommand : unixCommand);
                    executor.put("cleanup", cleanupCommands);
                    executors.add(executor);
                });
                break;
            case "FileDrop":
                FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(payload);
                Arrays.stream(payloadFileDrop.getPlatforms()).forEach(platform -> {
                    Map<String, Object> executor = new HashMap<>();
                    executor.put("platform", platform.equals(PLATFORM_TYPE.MacOS) ? "darwin" : platform.name().toLowerCase());
                    executor.put("name", platform.equals(PLATFORM_TYPE.Windows) ? "psh" : "sh");
                    String windowsCommand = "Invoke-WebRequest -Method GET -Uri " + openBASConfig.getBaseUrl() + "/api/documents/" + payloadFileDrop.getFileDropFile().getId() + "/file -Headers @{'Authorization' = 'Bearer " + openBASAdminConfig.getToken() + "'} -OutFile " + payloadFileDrop.getFileDropFile().getName();
                    String unixCommand = "curl -H \"Authorization: Bearer " + openBASAdminConfig.getToken() + "\" " + openBASConfig.getBaseUrl() + "/api/documents/" + payloadFileDrop.getFileDropFile().getId() + "/file -o " + payloadFileDrop.getFileDropFile().getName();
                    executor.put("command", platform.equals(PLATFORM_TYPE.Windows) ? windowsCommand : unixCommand);
                    executor.put("cleanup", cleanupCommands);
                    executors.add(executor);
                });
                break;
            case "DnsResolution":
                DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(payload);
                Arrays.stream(payloadDnsResolution.getPlatforms()).forEach(platform -> {
                    Map<String, Object> executor = new HashMap<>();
                    executor.put("platform", platform.equals(PLATFORM_TYPE.MacOS) ? "darwin" : platform.name().toLowerCase());
                    executor.put("name", platform.equals(PLATFORM_TYPE.Windows) ? "psh" : "sh");
                    AtomicReference<String> command = new AtomicReference<>("");
                    Arrays.stream(payloadDnsResolution.getHostname().split("\\r?\\n")).forEach(s -> {
                        command.set(command + "nslookup " + s + ";");
                    });
                    executor.put("command", command.get());
                    executor.put("cleanup", cleanupCommands);
                    executors.add(executor);
                });
                break;
            default:
                throw new UnsupportedOperationException("Payload type " + payload.getType() + " is not supported");
        }
        Map<String, Object> body = new HashMap<>();
        body.put("name", payload.getId());
        body.put("tactic", "openbas");
        body.put("technique_id", "openbas");
        body.put("technique_name", "openbas");
        body.put("executors", executors);
        return this.client.createAbility(body);
    }

    // -- AGENTS --

    public List<Agent> agents() {
        try {
            return this.client.agents().stream().toList();
        } catch (RuntimeException e) {
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
