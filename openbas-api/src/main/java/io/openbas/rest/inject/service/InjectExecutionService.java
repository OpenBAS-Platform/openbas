package io.openbas.rest.inject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.finding.FindingService;
import io.openbas.rest.inject.form.InjectExecutionInput;
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

  public void handleInjectExecutionCallback(
      String injectId, String agentId, InjectExecutionInput input) {
    Inject inject = null;

    try {
      inject = loadInjectOrThrow(injectId);
      Agent agent = loadAgentIfPresent(agentId);

      Set<OutputParser> outputParsers = outputStructuredUtils.extractOutputParsers(inject);
      Optional<ObjectNode> outputStructured =
          outputStructuredUtils.computeOutputStructured(outputParsers, input);

      processInjectExecution(inject, agent, input, outputParsers, outputStructured);
    } catch (ElementNotFoundException | JsonProcessingException e) {
      handleInjectExecutionError(inject, e);
    }
  }

  private void processInjectExecution(
      Inject inject,
      Agent agent,
      InjectExecutionInput input,
      Set<OutputParser> outputParsers,
      Optional<ObjectNode> outputStructured) {

    ObjectNode structured = outputStructured.orElse(null);
    injectStatusService.updateInjectStatus(agent, inject, input, structured);

    if (structured != null) {
      if (agent != null) {
        findingService.extractFindingsFromOutputParsers(inject, agent, outputParsers, structured);
      } else {
        // From Injectors
        findingService.extractFindingsFromInjectorContract(inject, structured);
      }
    }
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

  private void handleInjectExecutionError(Inject inject, Exception e) {
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
                        ExecutionTraceAction.COMPLETE,
                        null,
                        Instant.now());
                status.addTrace(trace);
              });
      injectRepository.save(inject);
    }
  }
}
