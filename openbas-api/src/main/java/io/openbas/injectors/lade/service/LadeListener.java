package io.openbas.injectors.lade.service;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.injectors.lade.LadeContract;
import io.openbas.injectors.lade.model.LadeWorkflow;
import java.time.Instant;
import java.util.List;
import java.util.logging.Level;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@Log
@RequiredArgsConstructor
public class LadeListener {

  private final InjectRepository injectRepository;
  private final InjectStatusRepository injectStatusRepository;
  private final LadeService ladeService;

  @Scheduled(fixedDelay = 15000, initialDelay = 0)
  public void listenWorkflows() {
    // Get all lade inject with workflow_id that are not done yet
    List<InjectStatus> injectStatuses =
        this.injectStatusRepository.pendingForInjectType(LadeContract.TYPE);
    // For each workflow ask for traces and status
    injectStatuses.forEach(
        injectStatus -> {
          // Add traces and close inject if needed.
          String asyncId =
              injectStatus.statusIdentifiers().stream()
                  .findFirst()
                  .orElse(null); // Lade handle only one asyncID for now
          try {
            LadeWorkflow workflowStatus = this.ladeService.getWorkflowStatus(asyncId);
            if (workflowStatus.isDone()) {
              ExecutionStatus name =
                  workflowStatus.isFail() ? ExecutionStatus.ERROR : ExecutionStatus.SUCCESS;
              injectStatus.setName(name);
              long executionTime =
                  workflowStatus.getStopTime().toEpochMilli()
                      - injectStatus.getTrackingSentDate().toEpochMilli();
              injectStatus.setTrackingTotalExecutionTime(executionTime);
            }
            injectStatus.setTraces(workflowStatus.getTraces());
            this.injectStatusRepository.save(injectStatus);
            // Update related inject
            Inject relatedInject = injectStatus.getInject();
            relatedInject.setUpdatedAt(Instant.now());
            this.injectRepository.save(relatedInject);
          } catch (Exception e) {
            log.log(Level.SEVERE, e.getMessage(), e);
          }
        });
  }
}
