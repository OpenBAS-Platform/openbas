package io.openbas.rest.inject.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ExecutableInjectService {

  private final InjectRepository injectRepository;
  private static final Pattern argumentsRegex = Pattern.compile("#\\{([^#{}]+)}");

  private List<String> getArgumentsFromCommandLines(String command) {
    Matcher matcher = argumentsRegex.matcher(command);
    List<String> commandParameters = new ArrayList<>();

    while (matcher.find()) {
      commandParameters.add(matcher.group(1));
    }

    return commandParameters;
  }

  private String replaceArgumentsByValue(
      String command, List<PayloadArgument> defaultArguments, ObjectNode injectContent) {

    List<String> arguments = getArgumentsFromCommandLines(command);

    for (String argument : arguments) {
      String value = "";

      // Try to get the value from injectContent
      if (injectContent.has(argument) && !injectContent.get(argument).asText().isEmpty()) {
        value = injectContent.get(argument).asText();
      } else {
        // Fallback to defaultContent
        value =
            defaultArguments.stream()
                .filter(a -> a.getKey().equals(argument))
                .map(PayloadArgument::getDefaultValue)
                .findFirst()
                .orElse("");
      }

      command = command.replace("#{" + argument + "}", value);
    }

    return command;
  }

  private String processAndEncodeCommand(
      String command,
      String executor,
      List<PayloadArgument> defaultArguments,
      ObjectNode injectContent,
      String obfuscator) {
    String computedCommand = replaceArgumentsByValue(command, defaultArguments, injectContent);

    if (executor.equals("cmd")) {
      computedCommand = computedCommand.trim().replace("\n", " & ");
    }

    if (obfuscator.equals("base64")) {
      return Base64.getEncoder().encodeToString(computedCommand.getBytes());
    }

    return computedCommand;
  }

  public Payload getExecutablePayloadInject(String injectId) {
    Inject inject =
        this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    InjectorContract contract =
        inject.getInjectorContract().orElseThrow(ElementNotFoundException::new);

    // prerequisite
    contract
        .getPayload()
        .getPrerequisites()
        .forEach(
            prerequisite -> {
              if (prerequisite.getCheckCommand() != null) {
                prerequisite.setCheckCommand(
                    processAndEncodeCommand(
                        prerequisite.getCheckCommand(),
                        prerequisite.getExecutor(),
                        contract.getPayload().getArguments(),
                        inject.getContent(),
                        "base64"));
              }
              if (prerequisite.getGetCommand() != null) {
                prerequisite.setGetCommand(
                    processAndEncodeCommand(
                        prerequisite.getGetCommand(),
                        prerequisite.getExecutor(),
                        contract.getPayload().getArguments(),
                        inject.getContent(),
                        "base64"));
              }
            });

    // cleanup
    if (contract.getPayload().getCleanupCommand() != null) {
      contract
          .getPayload()
          .setCleanupCommand(
              processAndEncodeCommand(
                  contract.getPayload().getCleanupCommand(),
                  contract.getPayload().getCleanupExecutor(),
                  contract.getPayload().getArguments(),
                  inject.getContent(),
                  "base64"));
    }

    // Command
    if (contract.getPayload().getTypeEnum().equals(PayloadType.COMMAND)) {
      Command payloadCommand = (Command) contract.getPayload();
      payloadCommand.setContent(
          processAndEncodeCommand(
              payloadCommand.getContent(),
              payloadCommand.getExecutor(),
              contract.getPayload().getArguments(),
              inject.getContent(),
              "base64"));
      return payloadCommand;
    }

    return contract.getPayload();
  }
}
