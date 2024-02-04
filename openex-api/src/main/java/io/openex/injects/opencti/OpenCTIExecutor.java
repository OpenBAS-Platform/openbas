package io.openex.injects.opencti;

import io.openex.config.OpenExConfig;
import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Injector;
import io.openex.injects.opencti.model.CaseContent;
import io.openex.injects.opencti.service.OpenCTIService;
import io.openex.model.Expectation;
import io.openex.model.expectation.ManualExpectation;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Stream;

import static io.openex.database.model.ExecutionTrace.traceError;
import static io.openex.injects.opencti.OpenCTIContract.OPENCTI_CREATE_CASE;

@Component(OpenCTIContract.TYPE)
public class OpenCTIExecutor extends Injector {

  @Resource
  private OpenExConfig openExConfig;

  private OpenCTIService openCTIService;

  @Autowired
  public void setOpenCTIService(OpenCTIService openCTIService) {
    this.openCTIService = openCTIService;
  }

  private void createCase(Execution execution, String name, String description, List<DataAttachment> attachments) {
    try {
      openCTIService.createCase(execution, name, description, attachments);
    } catch (Exception e) {
      execution.addTrace(traceError("email", e.getMessage(), e));
    }
  }

  private void createReport(Execution execution, String name, String description, List<DataAttachment> attachments) {
    try {
      openCTIService.createReport(execution, name, description, attachments);
    } catch (Exception e) {
      execution.addTrace(traceError("email", e.getMessage(), e));
    }
  }

  @Override
  public List<Expectation> process(
      @NotNull final Execution execution,
      @NotNull final ExecutableInject injection,
      @NotNull final Contract contract)
      throws Exception {
    Inject inject = injection.getInject();
    CaseContent content = contentConvert(injection, CaseContent.class);
    List<Document> documents = inject.getDocuments().stream().filter(InjectDocument::isAttached)
        .map(InjectDocument::getDocument).toList();
    List<DataAttachment> attachments = resolveAttachments(execution, injection, documents);
    String name = content.getName();
    String description = content.getDescription();
    Exercise exercise = injection.getSource().getExercise();
    switch (contract.getId()) {
      case OPENCTI_CREATE_CASE -> createCase(execution, name, description, attachments);
      default -> createReport(execution, name, description, attachments);
    }
    return content.getExpectations()
        .stream()
        .flatMap((entry) -> switch (entry.getType()) {
          case MANUAL -> Stream.of((Expectation) new ManualExpectation(entry.getScore(), entry.getName(), entry.getDescription()));
          default -> Stream.of();
        })
        .toList();
  }
}
