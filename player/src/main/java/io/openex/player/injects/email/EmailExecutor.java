package io.openex.player.injects.email;

import io.openex.player.injects.email.model.EmailAttachment;
import io.openex.player.injects.email.service.EmailService;
import io.openex.player.model.audience.User;
import io.openex.player.model.execution.Execution;
import io.openex.player.model.execution.ExecutionStatus;
import io.openex.player.utils.Executor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class EmailExecutor implements Executor<EmailInject> {

    @Autowired
    private EmailService eMailService;

    @Override
    public void process(EmailInject inject, Execution execution) throws Exception {
        String subject = inject.getSubject();
        String body = inject.getBody();
        String replyTo = inject.getReplyTo();
        // Resolve the attachments only one
        List<EmailAttachment> attachments = eMailService.resolveAttachments(inject.getAttachments());
        List<User> users = inject.getUsers();
        int numberOfExpected = users.size();
        AtomicInteger errors = new AtomicInteger(0);
        users.stream().parallel().forEach(user -> {
            String email = user.getEmail();
            try {
                eMailService.sendMessage(user, replyTo, subject, body, attachments);
                execution.addMessage("Mail sent to " + email);
            } catch (Exception e) {
                // TODO ADD AN ERROR LOGGER
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
