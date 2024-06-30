package io.openbas.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.*;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static io.openbas.database.model.InjectStatusExecution.traceError;


public abstract class Injector {

    @Resource
    protected ObjectMapper mapper;
    private FileService fileService;
    private DocumentRepository documentRepository;
    private InjectExpectationRepository injectExpectationRepository;

    @Autowired
    public void setInjectExpectationRepository(InjectExpectationRepository injectExpectationRepository) {
        this.injectExpectationRepository = injectExpectationRepository;
    }

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    public abstract ExecutionProcess process(Execution execution, ExecutableInject injection) throws Exception;

    private InjectExpectation expectationConverter(
        @NotNull final ExecutableInject executableInject,
        Expectation expectation) {
        InjectExpectation expectationExecution = new InjectExpectation();
        return this.expectationConverter(expectationExecution, executableInject, expectation);
    }
    private InjectExpectation expectationConverter(
        @NotNull final Team team,
        @NotNull final ExecutableInject executableInject,
        Expectation expectation) {
        InjectExpectation expectationExecution = new InjectExpectation();
        expectationExecution.setTeam(team);
        return this.expectationConverter(expectationExecution, executableInject, expectation);
    }
    private InjectExpectation expectationConverter(
        @NotNull InjectExpectation expectationExecution,
        @NotNull final ExecutableInject executableInject,
        @NotNull final Expectation expectation) {
        expectationExecution.setExercise(executableInject.getInjection().getExercise());
        expectationExecution.setInject(executableInject.getInjection().getInject());
        expectationExecution.setExpectedScore(expectation.getScore());
        expectationExecution.setExpectationGroup(expectation.isExpectationGroup());
        switch (expectation.type()) {
            case ARTICLE -> expectationExecution.setArticle(((ChannelExpectation) expectation).getArticle());
            case CHALLENGE -> expectationExecution.setChallenge(((ChallengeExpectation) expectation).getChallenge());
            case DOCUMENT -> expectationExecution.setType(EXPECTATION_TYPE.DOCUMENT);
            case TEXT -> expectationExecution.setType(EXPECTATION_TYPE.TEXT);
            case DETECTION -> {
                DetectionExpectation detectionExpectation = (DetectionExpectation) expectation;
                expectationExecution.setName(detectionExpectation.getName());
                expectationExecution.setDetection(detectionExpectation.getAsset(), detectionExpectation.getAssetGroup());
                expectationExecution.setSignatures(detectionExpectation.getInjectExpectationSignatures());
            }
            case PREVENTION -> {
                PreventionExpectation preventionExpectation = (PreventionExpectation) expectation;
                expectationExecution.setName(preventionExpectation.getName());
                expectationExecution.setPrevention(preventionExpectation.getAsset(), preventionExpectation.getAssetGroup());
                expectationExecution.setSignatures(preventionExpectation.getInjectExpectationSignatures());
            }
            case MANUAL -> {
                ManualExpectation manualExpectation = (ManualExpectation) expectation;
                expectationExecution.setName(((ManualExpectation) expectation).getName());
                expectationExecution.setManual(manualExpectation.getAsset(), manualExpectation.getAssetGroup());
                expectationExecution.setDescription(((ManualExpectation) expectation).getDescription());
            }
            default -> throw new IllegalStateException("Unexpected value: " + expectation);
        }
        return expectationExecution;
    }

    @Transactional
    public Execution execute(ExecutableInject executableInject) {
        Execution execution = new Execution(executableInject.isRuntime());
        try {
            boolean isScheduledInject = !executableInject.isDirect();
            boolean isAtomicTesting = executableInject.getInjection().getInject().isAtomicTesting();
            // If empty content, inject must be rejected
            if (executableInject.getInjection().getInject().getContent() == null) {
                throw new UnsupportedOperationException("Inject is empty");
            }
            // If inject is too old, reject the execution
            if (isScheduledInject && !isInInjectableRange(executableInject.getInjection())) {
                throw new UnsupportedOperationException("Inject is now too old for execution");
            }
            // Process the execution
            ExecutionProcess executionProcess = process(execution, executableInject);
            execution.setAsync(executionProcess.isAsync());
            List<Expectation> expectations = executionProcess.getExpectations();
            // Create the expectations
            List<Team> teams = executableInject.getTeams();
            List<Asset> assets = executableInject.getAssets();
            List<AssetGroup> assetGroups = executableInject.getAssetGroups();
            if ((isScheduledInject || isAtomicTesting) && !expectations.isEmpty()) {
                if (!teams.isEmpty()) {
                    List<InjectExpectation> injectExpectations = teams.stream()
                        .flatMap(team -> expectations.stream()
                            .map(expectation -> expectationConverter(team, executableInject, expectation)))
                        .toList();
                    this.injectExpectationRepository.saveAll(injectExpectations);
                } else if (!assets.isEmpty() || !assetGroups.isEmpty()) {
                    List<InjectExpectation> injectExpectations = expectations.stream()
                        .map(expectation -> expectationConverter(executableInject, expectation))
                        .toList();
                    this.injectExpectationRepository.saveAll(injectExpectations);
                }
            }
        } catch (Exception e) {
            execution.addTrace(traceError(e.getMessage()));
        } finally {
            execution.stop();
        }
        return execution;
    }

    public Execution executeInjection(ExecutableInject executableInject) {
        return execute(executableInject);
    }

    // region utils
    private boolean isInInjectableRange(Injection injection) {
        Instant now = Instant.now();
        Instant start = now.minus(Duration.parse("PT1H"));
        Instant injectWhen = injection.getDate().orElseThrow();
        return injectWhen.isAfter(start) && injectWhen.isBefore(now);
    }

    public <T> T contentConvert(@NotNull final ExecutableInject injection, @NotNull final Class<T> converter) throws Exception {
        Inject inject = injection.getInjection().getInject();
        ObjectNode content = inject.getContent();
        return this.mapper.treeToValue(content, converter);
    }

    public List<DataAttachment> resolveAttachments(Execution execution, ExecutableInject injection, List<Document> documents) {
        List<DataAttachment> resolved = new ArrayList<>();
        // Add attachments from direct configuration
        injection.getDirectAttachments().forEach(doc -> {
            try {
                byte[] content = IOUtils.toByteArray(doc.getInputStream());
                resolved.add(new DataAttachment(doc.getName(), doc.getOriginalFilename(), content, doc.getContentType()));
            } catch (Exception e) {
                String message = "Error getting direct attachment " + doc.getName();
                execution.addTrace(traceError(message));
            }
        });
        // Add attachments from configuration
        documents.forEach(attachment -> {
            String documentId = attachment.getId();
            Optional<Document> askedDocument = documentRepository.findById(documentId);
            try {
                Document doc = askedDocument.orElseThrow();
                InputStream fileInputStream = fileService.getFile(doc).orElseThrow();
                byte[] content = IOUtils.toByteArray(fileInputStream);
                resolved.add(new DataAttachment(documentId, doc.getName(), content, doc.getType()));
            } catch (Exception e) {
                // Can't fetch the attachments, ignore
                String docInfo = askedDocument.map(Document::getName).orElse(documentId);
                String message = "Error getting doc attachment " + docInfo;
                execution.addTrace(traceError(message));
            }
        });
        return resolved;
    }
    // endregion

}
