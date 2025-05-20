package io.openbas.rest.inject.service;

import static io.openbas.utils.InjectExecutionUtils.convertExecutionAction;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.finding.FindingService;
import io.openbas.rest.inject.form.InjectExecutionInput;
import jakarta.annotation.Resource;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Level;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class InjectExecutionService {

  private final InjectRepository injectRepository;
  private final AgentRepository agentRepository;
  private final InjectStatusService injectStatusService;
  private final FindingService findingService;
  private final OutputStructuredUtils outputStructuredUtils;

  @Resource private ObjectMapper mapper;

  public void handleInjectExecutionCallback(
      String injectId, String agentId, InjectExecutionInput input) {
    Inject inject = null;

    try {
      inject = loadInjectOrThrow(injectId);
      Agent agent = loadAgentIfPresent(agentId);

      ObjectNode outputStructured = computeOutputStructured(input, inject);
      processInjectExecution(input, agent, inject, outputStructured);
    } catch (ElementNotFoundException | JsonProcessingException e) {
      handleInjectExecutionError(e, inject);
    }
  }

  private void processInjectExecution(
      InjectExecutionInput input, Agent agent, Inject inject, ObjectNode outputStructured) {
    injectStatusService.updateInjectStatus(agent, inject, input, outputStructured);

    if (agent != null && outputStructured != null) {
      findingService.extractFindingsFromComputedOutputStructured(outputStructured, inject, agent);
    }
    // From injectors
    if (input.getOutputStructured() != null) {
      findingService.extractFindingsFromOutputStructured(outputStructured, inject);
    }
  }

  private ObjectNode computeOutputStructured(InjectExecutionInput input, Inject inject)
      throws JsonProcessingException {
    if (input.getOutputStructured() != null) {
      return mapper.readValue(input.getOutputStructured(), ObjectNode.class);
    }

    if (ExecutionTraceAction.EXECUTION.equals(convertExecutionAction(input.getAction()))) {
      return computeOutputStructuredFromOutputParsers(inject, input.getMessage());
    }

    return null;
  }

  private ObjectNode computeOutputStructuredFromOutputParsers(Inject inject, String rawOutput) {
    ObjectNode result = mapper.createObjectNode();

    Optional<Payload> optionalPayload = inject.getPayload();
    if (optionalPayload.isEmpty()) {
      log.info("No payload found for inject: " + inject.getId());
      return null;
    }

    Set<OutputParser> outputParsers = optionalPayload.get().getOutputParsers();
    if (outputParsers == null || outputParsers.isEmpty()) {
      log.info("No output parsers available for payload used in inject: " + inject.getId());
      return null;
    }

    for (OutputParser outputParser : outputParsers) {
      String rawOutputByMode =
          outputStructuredUtils.extractRawOutputByMode(rawOutput, outputParser.getMode());
      if (rawOutputByMode == null) {
        continue;
      }

      ObjectNode parsed;
      switch (outputParser.getType()) {
        case REGEX:
        default:
          parsed =
              outputStructuredUtils.computeOutputStructuredUsingRegexRules(
                  rawOutputByMode, outputParser.getContractOutputElements());
          break;
      }

      if (parsed != null) {
        result.setAll(parsed);
      }
    }

    return result.isEmpty() ? null : result;
  }

  private Agent loadAgentIfPresent(String agentId) {
    return (agentId == null)
        ? null
        : agentRepository
            .findById(agentId)
            .orElseThrow(() -> new ElementNotFoundException("Agent not found: " + agentId));
  }

  private Inject loadInjectOrThrow(String injectId) {
    return injectRepository
        .findById(injectId)
        .orElseThrow(() -> new ElementNotFoundException("Inject not found: " + injectId));
  }

  private void handleInjectExecutionError(Exception e, Inject inject) {
    log.log(Level.SEVERE, e.getMessage());
    if (inject != null) {
      inject
          .getStatus()
          .ifPresent(
              status -> {
                ExecutionTrace trace =
                    new ExecutionTrace(
                        status,
                        ExecutionTraceStatus.ERROR,
                        null,
                        e.getMessage(),
                        null,
                        ExecutionTraceAction.COMPLETE,
                        null,
                        Instant.now());
                status.addTrace(trace);
              });
      injectRepository.save(inject);
    }
  }
}
