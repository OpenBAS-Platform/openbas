package io.openex.injects.email;

import io.openex.database.model.Document;
import io.openex.database.model.InjectDocument;
import io.openex.database.model.User;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.ExecutionContext;
import io.openex.execution.Executor;
import io.openex.injects.email.model.EmailAttachment;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.model.EmailInject;
import io.openex.injects.email.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component
public class EmailExecutor implements Executor<EmailInject> {

    private EmailService emailService;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public void process(ExecutableInject<EmailInject> injection, Execution execution) {
        EmailInject inject = injection.getInject();
        EmailContent content = inject.getContent();
        List<Document> documents = inject.getDocuments().stream()
                .filter(InjectDocument::isAttached)
                .map(InjectDocument::getDocument).toList();
        String subject = content.getSubject();
        String message = inject.getContent().buildMessage(inject.getFooter(), inject.getHeader());
        boolean mustBeEncrypted = content.isEncrypted();
        // Resolve the attachments only once
        List<EmailAttachment> attachments = emailService.resolveAttachments(execution, documents);
        List<ExecutionContext> users = injection.getUsers();
        users.stream().parallel().forEach(userInjectContext -> {
            User user = userInjectContext.getUser();
            String email = user.getEmail();
            String replyTo = userInjectContext.getExercise().getReplyTo();
            try {
                emailService.sendEmail(userInjectContext, replyTo, mustBeEncrypted, subject, message, attachments);
                execution.addTrace(traceSuccess(user.getId(), "Mail sent to " + email));
            } catch (Exception e) {
                execution.addTrace(traceError(user.getId(), e.getMessage(), e));
            }
        });
    }
}
