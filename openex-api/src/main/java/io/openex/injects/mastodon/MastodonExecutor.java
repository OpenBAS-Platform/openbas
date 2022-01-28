package io.openex.injects.mastodon;

import io.openex.database.model.Document;
import io.openex.database.model.InjectDocument;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.Executor;
import io.openex.injects.mastodon.model.MastodonAttachment;
import io.openex.injects.mastodon.model.MastodonContent;
import io.openex.injects.mastodon.model.MastodonInject;
import io.openex.injects.mastodon.service.MastodonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component
public class MastodonExecutor implements Executor<MastodonInject> {

    private MastodonService mastodonService;

    @Autowired
    public void setMastodonService(MastodonService mastodonService) {
        this.mastodonService = mastodonService;
    }

    @Override
    public void process(ExecutableInject<MastodonInject> injection, Execution execution) {
        MastodonInject inject = injection.getInject();
        MastodonContent content = inject.getContent();
        String token = content.getToken();
        String status = content.buildStatus(inject.getFooter(), inject.getHeader());
        List<Document> documents = inject.getDocuments().stream()
                .filter(InjectDocument::isAttached).map(InjectDocument::getDocument).toList();
        List<MastodonAttachment> attachments = mastodonService.resolveAttachments(execution, documents);
        try {
            String callResult = mastodonService.sendStatus(execution, token, status, attachments);
            String message = "Mastodon status sent (" + callResult + ")";
            execution.addTrace(traceSuccess("mastodon", message));
        } catch (Exception e) {
            execution.addTrace(traceError("mastodon", e.getMessage(), e));
        }
    }
}
