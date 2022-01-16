package io.openex.injects.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.database.model.Injection;
import io.openex.database.model.User;
import io.openex.injects.email.form.EmailForm;
import io.openex.injects.email.model.EmailAttachment;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.service.EmailService;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.Executor;
import io.openex.execution.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component
public class EmailExecutor implements Executor<EmailContent> {

    private EmailService emailService;

    public EmailExecutor(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(EmailForm.class, EmailContract.NAME));
    }

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public void process(ExecutableInject<EmailContent> injection, Execution execution) {
        Injection<EmailContent> inject = injection.getInject();
        EmailContent content = inject.getContent();
        String subject = content.getSubject();
        String message = inject.getContent().buildMessage(inject.getFooter(), inject.getHeader());
        boolean mustBeEncrypted = content.isEncrypted();
        // Resolve the attachments only once
        List<EmailAttachment> attachments = emailService.resolveAttachments(execution, content.getAttachments());
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
