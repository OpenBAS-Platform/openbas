package io.openbas.injects.challenge;

import io.openbas.config.OpenBASConfig;
import io.openbas.contract.Contract;
import io.openbas.database.model.*;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.Injector;
import io.openbas.injects.challenge.model.ChallengeContent;
import io.openbas.injects.challenge.model.ChallengeVariable;
import io.openbas.injects.email.service.EmailService;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.ChallengeExpectation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static io.openbas.database.model.ExecutionTrace.traceError;
import static io.openbas.database.model.ExecutionTrace.traceSuccess;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injects.challenge.ChallengeContract.CHALLENGE_PUBLISH;

@Component(ChallengeContract.TYPE)
public class ChallengeExecutor extends Injector {

    @Resource
    private OpenBASConfig openBASConfig;

    private ChallengeRepository challengeRepository;

    private EmailService emailService;

    @Value("${openbas.mail.imap.enabled}")
    private boolean imapEnabled;

    @Autowired
    public void setChallengeRepository(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    private String buildChallengeUri(ExecutionContext context, Challenge challenge) {
        String userId = context.getUser().getId();
        String challengeId = challenge.getId();
        String exerciseId = context.getExercise().getId();
        return openBASConfig.getBaseUrl() + "/challenges/" + exerciseId + "?user=" + userId + "&challenge=" + challengeId;
    }

    @Override
    public List<Expectation> process(
        @NotNull final Execution execution,
        @NotNull final ExecutableInject injection,
        @NotNull final Contract contract) {
        try {
            ChallengeContent content = contentConvert(injection, ChallengeContent.class);
            List<Challenge> challenges = fromIterable(challengeRepository.findAllById(content.getChallenges()));
            if (contract.getId().equals(CHALLENGE_PUBLISH)) {
                // Challenge publishing is only linked to execution date of this inject.
                String challengeNames = challenges.stream().map(Challenge::getName).collect(Collectors.joining(","));
                String publishedMessage = "Challenges (" + challengeNames + ") marked as published";
                execution.addTrace(traceSuccess("challenge", publishedMessage));
                // Send the publication message.
                Exercise exercise = injection.getSource().getExercise();
                String replyTo = exercise.getReplyTo();
                List<ExecutionContext> users = injection.getContextUser();
                List<Document> documents = injection.getInject().getDocuments().stream()
                        .filter(InjectDocument::isAttached).map(InjectDocument::getDocument).toList();
                List<DataAttachment> attachments = resolveAttachments(execution, injection, documents);
                String message = content.buildMessage(injection, imapEnabled);
                boolean encrypted = content.isEncrypted();
                users.stream().parallel().forEach(userInjectContext -> {
                    try {
                        // Put the challenges variables in the injection context
                        List<ChallengeVariable> challengeVariables = challenges.stream()
                                .map(challenge -> new ChallengeVariable(challenge.getId(), challenge.getName(),
                                        buildChallengeUri(userInjectContext, challenge)))
                                .toList();
                        userInjectContext.put("challenges", challengeVariables);
                        // Send the email.
                        emailService.sendEmail(execution, userInjectContext, replyTo, content.getInReplyTo(), encrypted,
                                content.getSubject(), message, attachments);
                    } catch (Exception e) {
                        execution.addTrace(traceError("email", e.getMessage(), e));
                    }
                });
                // Return expectations
                List<Expectation> expectations = new ArrayList<>();
                challenges.forEach(challenge -> expectations.add(new ChallengeExpectation(challenge.getScore(), challenge)));
                return expectations;
            } else {
                throw new UnsupportedOperationException("Unknown contract " + contract.getId());
            }
        } catch (Exception e) {
            execution.addTrace(traceError("channel", e.getMessage(), e));
        }
        return List.of();
    }
}
