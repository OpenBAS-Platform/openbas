package io.openbas.injectors.mastodon;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceSuccess;

import io.openbas.database.model.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.mastodon.model.MastodonContent;
import io.openbas.injectors.mastodon.service.MastodonService;
import io.openbas.model.ExecutionProcess;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component(MastodonContract.TYPE)
@RequiredArgsConstructor
public class MastodonExecutor extends Injector {

  private final MastodonService mastodonService;

  @Override
  public ExecutionProcess process(
      @NotNull final Execution execution, @NotNull final ExecutableInject injection)
      throws Exception {
    Inject inject = injection.getInjection().getInject();
    MastodonContent content = contentConvert(injection, MastodonContent.class);
    String token = content.getToken();
    String status = content.buildStatus(inject.getFooter(), inject.getHeader());
    List<Document> documents =
        inject.getDocuments().stream()
            .filter(InjectDocument::isAttached)
            .map(InjectDocument::getDocument)
            .toList();
    List<DataAttachment> attachments = resolveAttachments(execution, injection, documents);
    try {
      String callResult = mastodonService.sendStatus(execution, token, status, attachments);
      String message = "Mastodon status sent (" + callResult + ")";
      execution.addTrace(traceSuccess(message));
    } catch (Exception e) {
      execution.addTrace(traceError(e.getMessage()));
    }
    return new ExecutionProcess(false);
  }
}
