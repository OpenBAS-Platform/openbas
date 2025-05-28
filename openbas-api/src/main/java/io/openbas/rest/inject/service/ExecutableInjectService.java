package io.openbas.rest.inject.service;

import static org.springframework.util.StringUtils.hasText;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.injectors.openbas.model.OpenBASImplantInjectContent;
import io.openbas.injectors.openbas.util.OpenBASObfuscationMap;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.payload.service.PayloadService;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ExecutableInjectService {

  private final InjectService injectService;
  private final InjectStatusService injectStatusService;
  private final PayloadService payloadService;
  private static final Pattern argumentsRegex = Pattern.compile("#\\{([^#{}]+)}");
  private static final Pattern cmdVariablesRegex = Pattern.compile("%(\\w+)%");
  private final InjectStatusRepository injectStatusRepository;

  private List<String> getArgumentsFromCommandLines(String command) {
    Matcher matcher = argumentsRegex.matcher(command);
    List<String> commandParameters = new ArrayList<>();

    while (matcher.find()) {
      commandParameters.add(matcher.group(1));
    }

    return commandParameters;
  }

  private String replaceArgumentsByValue(
      String command,
      List<PayloadArgument> defaultArguments,
      ObjectNode injectContent,
      List<ExecutionBinding> executionBindings) {

    List<String> arguments = getArgumentsFromCommandLines(command);

    for (String argument : arguments) {
      String value = "";

      // 1. Try executionBindings first
      if (executionBindings != null && !executionBindings.isEmpty()) {
        Optional<ExecutionBinding> bindingOpt =
            executionBindings.stream()
                .filter(binding -> binding.getArgumentKey().equals(argument))
                .findFirst();

        if (bindingOpt.isPresent()) {
          value = bindingOpt.get().getArgumentValue();
        }
      }

      // 2. If not found, try injectContent
      if (value.isEmpty() && injectContent != null && injectContent.has(argument)) {
        String injectedValue = injectContent.get(argument).asText();
        if (!injectedValue.isEmpty()) {
          value = injectedValue;
        }
      }

      // 3. If still not found, try defaultArguments
      if (value.isEmpty()) {
        value =
            defaultArguments.stream()
                .filter(a -> a.getKey().equals(argument))
                .map(PayloadArgument::getDefaultValue)
                .findFirst()
                .orElse("");
      }

      // Replace the placeholder
      command = command.replace("#{" + argument + "}", value);
    }

    return command;
  }

  public static String replaceCmdVariables(String cmd) { // TODO POC TO CHECK
    Matcher matcher = cmdVariablesRegex.matcher(cmd);

    StringBuilder result = new StringBuilder();
    while (matcher.find()) {
      String variableName = matcher.group(1);
      matcher.appendReplacement(result, "!" + variableName + "!");
    }
    matcher.appendTail(result);

    return result.toString();
  }

  private static String formatMultilineCommand(String command) {
    String[] lines = command.split("\n");
    StringBuilder formattedCommand = new StringBuilder();

    for (int i = 0; i < lines.length; i++) {
      String line = lines[i];
      String trimmedLine = line.trim();
      if (trimmedLine.isEmpty()) {
        continue;
      }
      formattedCommand.append(trimmedLine);

      boolean isLastLine = (i == lines.length - 1);
      boolean isAfterParentheses = trimmedLine.endsWith("(");
      boolean isBeforeParentheses = !isLastLine && lines[i + 1].trim().startsWith(")");

      if (!isAfterParentheses && !isBeforeParentheses && !isLastLine) {
        formattedCommand.append(" & ");
      } else {
        formattedCommand.append(" ");
      }
    }

    return formattedCommand.toString();
  }

  private String processAndEncodeCommand(
      String command,
      String executor,
      List<PayloadArgument> defaultArguments,
      ObjectNode injectContent,
      List<ExecutionBinding> executionBindings,
      String obfuscator) {
    OpenBASObfuscationMap obfuscationMap = new OpenBASObfuscationMap();
    String computedCommand =
        replaceArgumentsByValue(command, defaultArguments, injectContent, executionBindings);

    if (executor.equals("cmd")) {
      computedCommand = replaceCmdVariables(computedCommand);
      computedCommand = formatMultilineCommand(computedCommand);
    }

    computedCommand = obfuscationMap.executeObfuscation(obfuscator, computedCommand, executor);

    return Base64.getEncoder().encodeToString(computedCommand.getBytes());
  }

  public Payload getExecutablePayloadAndUpdateInjectStatus(String executionId, String agentId)
      throws Exception {
    Payload payloadToExecute = getExecutablePayloadInject(executionId);
    this.injectStatusService.addStartImplantExecutionTraceByInject(
        executionId, agentId, "Implant is up and starting execution");
    return payloadToExecute;
  }

  private Payload getExecutablePayloadInject(String executionId) throws Exception {
    InjectStatus execution = injectStatusRepository.findById(executionId).orElseThrow();
    Inject inject = execution.getInject(); // TODO POC
    InjectorContract contract =
        inject
            .getInjectorContract()
            .orElseThrow(() -> new ElementNotFoundException("Inject contract not found"));
    OpenBASImplantInjectContent content =
        injectService.convertInjectContent(inject, OpenBASImplantInjectContent.class);
    String obfuscator = content.getObfuscator() != null ? content.getObfuscator() : "plain-text";

    if (contract.getPayload() == null) {
      throw new ElementNotFoundException("Payload not found");
    }
    Payload payloadToExecute = payloadService.generateDuplicatedPayload(contract.getPayload());

    // prerequisite
    List<PayloadPrerequisite> prerequisiteList = new ArrayList<>();
    contract
        .getPayload()
        .getPrerequisites()
        .forEach(
            prerequisite -> {
              PayloadPrerequisite payload = new PayloadPrerequisite();
              payload.setExecutor(prerequisite.getExecutor());
              if (hasText(prerequisite.getCheckCommand())) {
                payload.setCheckCommand(
                    processAndEncodeCommand(
                        prerequisite.getCheckCommand(),
                        prerequisite.getExecutor(),
                        contract.getPayload().getArguments(),
                        inject.getContent(),
                        execution.getExecutionBindings(),
                        obfuscator));
              }
              if (hasText(prerequisite.getGetCommand())) {
                payload.setGetCommand(
                    processAndEncodeCommand(
                        prerequisite.getGetCommand(),
                        prerequisite.getExecutor(),
                        contract.getPayload().getArguments(),
                        inject.getContent(),
                        execution.getExecutionBindings(),
                        obfuscator));
              }
              prerequisiteList.add(payload);
            });
    payloadToExecute.setPrerequisites(prerequisiteList);

    // cleanup
    if (contract.getPayload().getCleanupCommand() != null) {
      payloadToExecute.setCleanupExecutor(contract.getPayload().getCleanupExecutor());
      payloadToExecute.setCleanupCommand(
          processAndEncodeCommand(
              contract.getPayload().getCleanupCommand(),
              contract.getPayload().getCleanupExecutor(),
              contract.getPayload().getArguments(),
              inject.getContent(),
              execution.getExecutionBindings(),
              obfuscator));
    }

    // Command
    if (contract.getPayload().getTypeEnum().equals(PayloadType.COMMAND)) {
      Command payloadCommand = (Command) payloadToExecute;
      payloadCommand.setExecutor(((Command) contract.getPayload()).getExecutor());
      payloadCommand.setContent(
          processAndEncodeCommand(
              payloadCommand.getContent(),
              payloadCommand.getExecutor(),
              contract.getPayload().getArguments(),
              inject.getContent(),
              execution.getExecutionBindings(),
              obfuscator));
      return payloadCommand;
    }

    return payloadToExecute;
  }
}
