package io.openex.injects.mastodon;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.database.model.Injection;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.Executor;
import io.openex.injects.mastodon.form.MastodonForm;
import io.openex.injects.mastodon.model.MastodonAttachment;
import io.openex.injects.mastodon.model.MastodonContent;
import io.openex.injects.mastodon.service.MastodonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component
public class MastodonExecutor implements Executor<MastodonContent> {

    private MastodonService mastodonService;

    public MastodonExecutor(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(MastodonForm.class, MastodonContract.NAME));
    }

    @Autowired
    public void setMastodonService(MastodonService mastodonService) {
        this.mastodonService = mastodonService;
    }

    @Override
    public void process(ExecutableInject<MastodonContent> injection, Execution execution) {
        Injection<MastodonContent> inject = injection.getInject();
        MastodonContent content = inject.getContent();
        String token = inject.getContent().getToken();
        String status = inject.getContent().buildStatus(inject.getFooter(), inject.getHeader());
        List<MastodonAttachment> attachments = mastodonService.resolveAttachments(execution, content.getAttachments());
        try {
            String callResult = mastodonService.sendStatus(execution, token, status, attachments);
            String message = "Mastodon status sent (" + callResult + ")";
            execution.addTrace(traceSuccess("mastodon", message));
        } catch (Exception e) {
            execution.addTrace(traceError("mastodon", e.getMessage(), e));
        }
    }
}
