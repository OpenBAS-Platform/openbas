package io.openex.injects.email;

import io.openex.database.model.Document;
import io.openex.database.model.Inject;
import io.openex.database.model.InjectDocument;
import io.openex.database.model.User;
import io.openex.execution.BasicExecutor;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.ExecutionContext;
import io.openex.injects.email.model.EmailAttachment;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component("openex_email")
public class EmailExecutor extends BasicExecutor {

    private EmailService emailService;

    @Value("${openex.mail.imap.enabled}")
    private boolean imapEnabled;

    @Value("${spring.mail.username}")
    private String imapUsername;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public void process(ExecutableInject injection, Execution execution) throws Exception {
        Inject inject = injection.getInject();
        EmailContent content = contentConvert(injection, EmailContent.class);
        List<Document> documents = inject.getDocuments().stream()
                .filter(InjectDocument::isAttached)
                .map(InjectDocument::getDocument).toList();
        String subject = content.getSubject();
        String message = content.buildMessage(inject.getId(), inject.getFooter(), inject.getHeader());
        boolean mustBeEncrypted = content.isEncrypted();
        // Resolve the attachments only once
        List<EmailAttachment> attachments = emailService.resolveAttachments(execution, documents);
        List<ExecutionContext> users = injection.getUsers();
        if (users.size() == 0) {
            throw new UnsupportedOperationException("Email needs at least one user");
        }
        users.stream().parallel().forEach(userInjectContext -> {
            User user = userInjectContext.getUser();
            String email = user.getEmail();
            String replyTo = imapEnabled ? imapUsername : userInjectContext.getExercise().getReplyTo();
            try {
                emailService.sendEmail(userInjectContext, replyTo, mustBeEncrypted, subject, message, attachments);
                execution.addTrace(traceSuccess(user.getId(), "Mail sent to " + email));
            } catch (Exception e) {
                execution.addTrace(traceError(user.getId(), e.getMessage(), e));
            }
        });
    }
}
