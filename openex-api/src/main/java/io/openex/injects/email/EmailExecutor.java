package io.openex.injects.email;

import io.openex.config.OpenExConfig;
import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.execution.Injector;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.service.EmailService;
import io.openex.model.Expectation;
import io.openex.model.expectation.DocumentExpectation;
import io.openex.model.expectation.TextExpectation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

import static io.openex.database.model.ExecutionTrace.traceError;
import static io.openex.injects.email.EmailContract.EMAIL_GLOBAL;

@Component(EmailContract.TYPE)
public class EmailExecutor extends Injector {

    @Resource
    private OpenExConfig openExConfig;

    private EmailService emailService;

    @Value("${openex.mail.imap.enabled}")
    private boolean imapEnabled;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    private void sendMulti(Execution execution, List<ExecutionContext> users, String replyTo, String inReplyTo, String subject, String message, List<DataAttachment> attachments, boolean storeInImap) {
        try {
            emailService.sendEmail(execution, users, replyTo, inReplyTo, subject, message, attachments, storeInImap);
        } catch (Exception e) {
            execution.addTrace(traceError("email", e.getMessage(), e));
        }
    }

    private void sendSingle(Execution execution, List<ExecutionContext> users, String replyTo, String inReplyTo, boolean mustBeEncrypted, String subject, String message, List<DataAttachment> attachments, boolean storeInImap) {
        users.stream().parallel().forEach(user -> {
            try {
                emailService.sendEmail(execution, user, replyTo, inReplyTo, mustBeEncrypted, subject, message, attachments, storeInImap);
            } catch (Exception e) {
                execution.addTrace(traceError("email", e.getMessage(), e));
            }
        });
    }

    private String buildDocumentUri(ExecutionContext context, Inject inject) {
        String userId = context.getUser().getId();
        String exerciseId = context.getExercise().getId();
        String injectId = inject.getId();
        return openExConfig.getBaseUrl() + "/expectation/document/" + exerciseId + "/" + injectId + "?user=" + userId;
    }

    @Override
    public List<Expectation> process(Execution execution, ExecutableInject injection, Contract contract) throws Exception {
        boolean storeInImap = !injection.isTestingInject();
        Inject inject = injection.getInject();
        EmailContent content = contentConvert(injection, EmailContent.class);
        List<Document> documents = inject.getDocuments().stream().filter(InjectDocument::isAttached).map(InjectDocument::getDocument).toList();
        List<DataAttachment> attachments = resolveAttachments(execution, documents);
        String inReplyTo = content.getInReplyTo();
        String subject = content.getSubject();
        String message = content.buildMessage(inject, imapEnabled);
        boolean mustBeEncrypted = content.isEncrypted();
        // Resolve the attachments only once
        List<ExecutionContext> users = injection.getUsers();
        if (users.size() == 0) {
            throw new UnsupportedOperationException("Email needs at least one user");
        }
        // If a doc upload is required, add the doc uri variable
        if (content.getExpectationType().equals("document")) {
            users = users.stream().peek(context ->
                    context.put("document_uri", buildDocumentUri(context, inject)))
                    .toList();
        }
        Exercise exercise = injection.getSource().getExercise();
        String replyTo = exercise.getReplyTo();
        //noinspection SwitchStatementWithTooFewBranches
        switch (contract.getId()) {
            case EMAIL_GLOBAL ->
                    sendMulti(execution, users, replyTo, inReplyTo, subject, message, attachments, storeInImap);
            default ->
                    sendSingle(execution, users, replyTo, inReplyTo, mustBeEncrypted, subject, message, attachments, storeInImap);
        }
        return switch (content.getExpectationType()) {
            case "document" -> List.of(new DocumentExpectation());
            case "text" -> List.of(new TextExpectation());
            default -> List.of();
        };
    }
}
