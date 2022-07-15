package io.openex.injects.email;

import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.execution.Injector;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.database.model.ExecutionTrace.traceError;
import static io.openex.injects.email.EmailContract.EMAIL_GLOBAL;

@Component(EmailContract.TYPE)
public class EmailExecutor extends Injector {

    private EmailService emailService;

    @Value("${openex.mail.imap.enabled}")
    private boolean imapEnabled;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    private void sendMulti(Execution execution, List<ExecutionContext> users, String replyTo, String subject,
                           String message, List<DataAttachment> attachments) {
        try {
            emailService.sendEmail(execution, users, replyTo, subject, message, attachments);
        } catch (Exception e) {
            execution.addTrace(traceError("email", e.getMessage(), e));
        }
    }

    private void sendSingle(Execution execution, List<ExecutionContext> users, String replyTo, boolean mustBeEncrypted,
                            String subject, String message, List<DataAttachment> attachments) {
        users.stream().parallel().forEach(user -> {
            try {
                emailService.sendEmail(execution, user, replyTo, mustBeEncrypted, subject, message, attachments);
            } catch (Exception e) {
                execution.addTrace(traceError("email", e.getMessage(), e));
            }
        });
    }

    @Override
    public void process(Execution execution, ExecutableInject injection, Contract contract) throws Exception {
        Inject inject = injection.getInject();
        EmailContent content = contentConvert(injection, EmailContent.class);
        List<Document> documents = inject.getDocuments().stream()
                .filter(InjectDocument::isAttached)
                .map(InjectDocument::getDocument).toList();
        List<DataAttachment> attachments = resolveAttachments(execution, documents);
        String subject = content.getSubject();
        String message = content.buildMessage(inject, imapEnabled);
        boolean mustBeEncrypted = content.isEncrypted();
        // Resolve the attachments only once
        List<ExecutionContext> users = injection.getUsers();
        if (users.size() == 0) {
            throw new UnsupportedOperationException("Email needs at least one user");
        }
        Exercise exercise = injection.getSource().getExercise();
        String replyTo = exercise.getReplyTo();
        //noinspection SwitchStatementWithTooFewBranches
        switch (contract.getId()) {
            case EMAIL_GLOBAL -> sendMulti(execution, users, replyTo, subject, message, attachments);
            default -> sendSingle(execution, users, replyTo, mustBeEncrypted, subject, message, attachments);
        }
    }
}
