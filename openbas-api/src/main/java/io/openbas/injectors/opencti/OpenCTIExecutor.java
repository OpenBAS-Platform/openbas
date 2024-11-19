package io.openbas.injectors.opencti;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.injectors.opencti.OpenCTIContract.OPENCTI_CREATE_CASE;

import io.openbas.database.model.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.inject_expectation.InjectExpectationUtils;
import io.openbas.injectors.opencti.model.CaseContent;
import io.openbas.injectors.opencti.service.OpenCTIService;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.ManualExpectation;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component(OpenCTIContract.TYPE)
public class OpenCTIExecutor extends Injector {

  private OpenCTIService openCTIService;

  @Autowired
  public void setOpenCTIService(OpenCTIService openCTIService) {
    this.openCTIService = openCTIService;
  }

  private void createCase(
      Execution execution, String name, String description, List<DataAttachment> attachments) {
    try {
      openCTIService.createCase(execution, name, description, attachments);
    } catch (Exception e) {
      execution.addTrace(traceError(e.getMessage()));
    }
  }

  private void createReport(
      Execution execution, String name, String description, List<DataAttachment> attachments) {
    try {
      openCTIService.createReport(execution, name, description, attachments);
    } catch (Exception e) {
      execution.addTrace(traceError(e.getMessage()));
    }
  }

  @Override
  public ExecutionProcess process(
      @NotNull final Execution execution, @NotNull final ExecutableInject injection)
      throws Exception {
    Inject inject = injection.getInjection().getInject();
    CaseContent content = contentConvert(injection, CaseContent.class);
    List<Document> documents =
        inject.getDocuments().stream()
            .filter(InjectDocument::isAttached)
            .map(InjectDocument::getDocument)
            .toList();
    List<DataAttachment> attachments = resolveAttachments(execution, injection, documents);
    String name = content.getName();
    String description = content.getDescription();

    inject
        .getInjectorContract()
        .ifPresent(
            injectorContract -> {
              switch (injectorContract.getId()) {
                case OPENCTI_CREATE_CASE -> createCase(execution, name, description, attachments);
                default -> createReport(execution, name, description, attachments);
              }
            });

    List<Expectation> expectations =
        content.getExpectations().stream()
            .flatMap(
                (entry) ->
                    switch (entry.getType()) {
                      case MANUAL -> Stream.of((Expectation) new ManualExpectation(entry));
                      default -> Stream.of();
                    })
            .toList();
    InjectExpectationUtils.extractedExpectations(injection, expectations);
    return new ExecutionProcess(false);
  }
}
