package io.openex.injects.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.database.model.Injection;
import io.openex.injects.email.form.EmailForm;
import io.openex.injects.email.model.EmailAttachment;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.service.EmailService;
import io.openex.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class EmailExecutor implements Executor<EmailContent> {

    private static final Logger LOGGER = Logger.getLogger(EmailExecutor.class.getName());
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
        // Resolve the attachments only once
        List<EmailAttachment> attachments = emailService.resolveAttachments(execution, content.getAttachments());
        List<UserInjectContext> users = injection.getUsers();
        int numberOfExpected = users.size();
        AtomicInteger errors = new AtomicInteger(0);
        users.stream().parallel().forEach(user -> {
            String email = user.getUser().getEmail();
            String replyTo = user.getExercise().getReplyTo();
            try {
                emailService.sendEmail(user, replyTo, subject, message, attachments);
                execution.addMessage("Mail sent to " + email);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, e.getMessage(), e);
                errors.incrementAndGet();
                execution.addMessage(e.getMessage());
            }
        });
        int numberOfErrors = errors.get();
        if (numberOfErrors > 0) {
            ExecutionStatus status = numberOfErrors == numberOfExpected ? ExecutionStatus.ERROR : ExecutionStatus.PARTIAL;
            execution.setStatus(status);
        }
    }
}
