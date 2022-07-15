package io.openex.rest.inject;

import io.openex.config.OpenExConfig;
import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openex.database.repository.*;
import io.openex.database.specification.InjectSpecification;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.execution.Injector;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.inject.form.*;
import io.openex.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static io.openex.database.model.ExecutionTrace.traceSuccess;
import static io.openex.database.specification.CommunicationSpecification.fromInject;
import static io.openex.helper.DatabaseHelper.resolveOptionalRelation;
import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.helper.UserHelper.currentUser;
import static java.time.Instant.now;

@RestController
public class InjectApi extends RestBehavior {

    private static final int MAX_NEXT_INJECTS = 6;

    @Resource
    private OpenExConfig openExConfig;

    private CommunicationRepository communicationRepository;
    private ExerciseRepository exerciseRepository;
    private UserRepository userRepository;
    private InjectRepository injectRepository;
    private InjectDocumentRepository injectDocumentRepository;
    private InjectExpectationRepository injectExpectationRepository;
    private AudienceRepository audienceRepository;
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;
    private ApplicationContext context;
    private ContractService contractService;
    private ArticleRepository articleRepository;
    private ChallengeRepository challengeRepository;

    @Autowired
    public void setInjectExpectationRepository(InjectExpectationRepository injectExpectationRepository) {
        this.injectExpectationRepository = injectExpectationRepository;
    }

    @Autowired
    public void setArticleRepository(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Autowired
    public void setChallengeRepository(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setCommunicationRepository(CommunicationRepository communicationRepository) {
        this.communicationRepository = communicationRepository;
    }

    @Autowired
    public void setInjectDocumentRepository(InjectDocumentRepository injectDocumentRepository) {
        this.injectDocumentRepository = injectDocumentRepository;
    }

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setContractService(ContractService contractService) {
        this.contractService = contractService;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @GetMapping("/api/inject_types")
    public List<Contract> injectTypes() {
        return contractService.getContracts().values().stream().toList();
    }

    @GetMapping("/api/injects/try/{injectId}")
    public InjectStatus execute(@PathVariable String injectId) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        List<ExecutionContext> userInjectContexts =
                List.of(new ExecutionContext(openExConfig, currentUser(), inject, "Direct test"));
        Contract contract = contractService.resolveContract(inject);
        if (contract == null) {
            throw new UnsupportedOperationException("Unknown inject contract " + inject.getContract());
        }
        ExecutableInject injection = new ExecutableInject(inject, contract, userInjectContexts);
        Injector executor = context.getBean(contract.getConfig().getType(), Injector.class);
        Execution execution = executor.executeDirectly(injection);
        return InjectStatus.fromExecution(execution, inject);
    }


    private boolean isNotAlreadyExistingExpectation(InjectExpectationInput input, List<InjectExpectation> injectExpectations) {
        List<String> currentExpectationIds = injectExpectations.stream()
                .filter(expectation -> expectation.getArticle() != null || expectation.getChallenge() != null)
                .map(expectation -> {
                    if (expectation.getArticle() != null) {
                        return expectation.getArticle().getId();
                    } else {
                        return expectation.getChallenge().getId();
                    }
                }).toList();
        if (input.getArticleId() != null) {
            return !currentExpectationIds.contains(input.getArticleId());
        } else if (input.getChallengeId() != null) {
            return !currentExpectationIds.contains(input.getChallengeId());
        }
        return true;
    }

    private void updateInjectExpectation(InjectExpectation expectation, InjectExpectationInput input, Inject inject) {
        expectation.setInject(inject);
        EXPECTATION_TYPE expectationType = EXPECTATION_TYPE.valueOf(input.getType());
        expectation.setType(expectationType);
        if (input.getArticleId() != null && input.getChallengeId() != null) {
            throw new UnsupportedOperationException("Expectation cannot be based on article and challenge");
        }
        if (input.getDocument() != null && expectationType != EXPECTATION_TYPE.DOCUMENT) {
            throw new UnsupportedOperationException("Expectation with document name must be typed as DOCUMENT type");
        }
        if (input.getArticleId() != null) {
            if (expectationType != EXPECTATION_TYPE.ARTICLE) {
                throw new UnsupportedOperationException("Expectation with article Id must be typed as ARTICLE type");
            }
            expectation.setArticle(articleRepository.findById(input.getArticleId()).orElse(null));
        }
        if (input.getChallengeId() != null) {
            if (expectationType != EXPECTATION_TYPE.CHALLENGE) {
                throw new UnsupportedOperationException("Expectation with challenge Id must be typed as CHALLENGE type");
            }
            expectation.setChallenge(challengeRepository.findById(input.getChallengeId()).orElse(null));
        }
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping("/api/injects/{exerciseId}/{injectId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject updateInject(@PathVariable String exerciseId, @PathVariable String injectId,
                               @Valid @RequestBody InjectInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        inject.setUpdateAttributes(input);
        // Set dependencies
        inject.setDependsOn(updateRelation(input.getDependsOn(), inject.getDependsOn(), injectRepository));
        inject.setAudiences(fromIterable(audienceRepository.findAllById(input.getAudiences())));
        inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        List<InjectDocumentInput> documents = input.getDocuments();
        List<String> askedDocumentIds = documents.stream().map(InjectDocumentInput::getDocumentId).toList();
        List<String> currentDocumentIds = inject.getDocuments().stream()
                .map(document -> document.getDocument().getId()).toList();
        // region Set expectations
        List<InjectExpectation> injectExpectations = inject.getExpectations();
        // To delete
        List<String> expectInputIds = input.getExpectations().stream().map(InjectExpectationInput::getId).toList();
        List<InjectExpectation> expectationsToDelete = inject.getExpectations().stream()
                .filter(expectation -> !expectInputIds.contains(expectation.getId())).toList();
        if (expectationsToDelete.size() > 0) {
            injectExpectationRepository.deleteAll(expectationsToDelete);
            injectExpectations.removeAll(expectationsToDelete);
        }
        // To add / update
        input.getExpectations().forEach(in -> {
            if (in.getId() == null && isNotAlreadyExistingExpectation(in, injectExpectations)) {
                InjectExpectation expectation = new InjectExpectation();
                updateInjectExpectation(expectation, in, inject);
                injectExpectations.add(expectation);
            } else if (in.getId() != null) {
                InjectExpectation expectation = injectExpectationRepository.findById(in.getId()).orElseThrow();
                updateInjectExpectation(expectation, in, inject);
            }
        });
        inject.setExpectations(injectExpectations);
        // endregion
        // region Set documents
        List<InjectDocument> injectDocuments = new ArrayList<>(inject.getDocuments());
        // To delete
        inject.getDocuments().stream()
                .filter(injectDoc -> !askedDocumentIds.contains(injectDoc.getDocument().getId()))
                .forEach(injectDoc -> {
                    injectDocuments.remove(injectDoc);
                    injectDocumentRepository.delete(injectDoc);
                });
        // To add
        documents.stream()
                .filter(doc -> !currentDocumentIds.contains(doc.getDocumentId()))
                .forEach(in -> {
                    Optional<Document> doc = documentRepository.findById(in.getDocumentId());
                    if (doc.isPresent()) {
                        InjectDocument injectDocument = new InjectDocument();
                        injectDocument.setInject(inject);
                        Document document = doc.get();
                        injectDocument.setDocument(document);
                        injectDocument.setAttached(in.isAttached());
                        InjectDocument savedInjectDoc = injectDocumentRepository.save(injectDocument);
                        injectDocuments.add(savedInjectDoc);
                        // If Document not yet linked directly to the exercise, attached it
                        if (!document.getExercises().contains(exercise)) {
                            exercise.getDocuments().add(document);
                            exerciseRepository.save(exercise);
                        }
                    }
                });
        // Remap the attached boolean
        injectDocuments.forEach(injectDoc -> {
            Optional<InjectDocumentInput> inputInjectDoc = input.getDocuments().stream()
                    .filter(id -> id.getDocumentId().equals(injectDoc.getDocument().getId()))
                    .findFirst();
            Boolean attached = inputInjectDoc.map(InjectDocumentInput::isAttached).orElse(false);
            injectDoc.setAttached(attached);
        });
        inject.setDocuments(injectDocuments);
        // endregion
        return injectRepository.save(inject);
    }

    @GetMapping("/api/exercises/{exerciseId}/injects")
    public Iterable<Inject> exerciseInjects(@PathVariable String exerciseId) {
        return injectRepository.findAll(InjectSpecification.fromExercise(exerciseId))
                .stream().sorted(Inject.executionComparator).toList();
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}")
    public Inject exerciseInject(@PathVariable String injectId) {
        return injectRepository.findById(injectId).orElseThrow();
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}/audiences")
    public Iterable<Audience> exerciseInjectAudiences(@PathVariable String injectId) {
        return injectRepository.findById(injectId).orElseThrow().getAudiences();
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}/communications")
    public Iterable<Communication> exerciseInjectCommunications(@PathVariable String injectId) {
        return communicationRepository.findAll(fromInject(injectId), Sort.by(Sort.Direction.DESC, "receivedAt"));
    }

    @PostMapping("/api/exercises/{exerciseId}/injects")
    public Inject createInject(@PathVariable String exerciseId, @Valid @RequestBody InjectInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        // Get common attributes
        Inject inject = input.toInject();
        inject.setType(contractService.getContractType(input.getContract()));
        inject.setUser(currentUser());
        inject.setExercise(exercise);
        // Set dependencies
        inject.setDependsOn(resolveOptionalRelation(input.getDependsOn(), injectRepository));
        inject.setAudiences(fromIterable(audienceRepository.findAllById(input.getAudiences())));
        inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return injectRepository.save(inject);
    }

    @PostMapping("/api/exercises/{exerciseId}/inject")
    public InjectStatus executeInject(@PathVariable String exerciseId, @Valid @RequestBody DirectInjectInput input) {
        Inject inject = input.toInject();
        Contract contract = contractService.resolveContract(inject);
        if (contract == null) {
            throw new UnsupportedOperationException("Unknown inject contract " + inject.getContract());
        }
        inject.setType(contract.getConfig().getType());
        inject.setUser(currentUser());
        inject.setExercise(exerciseRepository.findById(exerciseId).orElseThrow());
        Iterable<User> users = userRepository.findAllById(input.getUserIds());
        List<ExecutionContext> userInjectContexts = fromIterable(users).stream()
                .map(user -> new ExecutionContext(openExConfig, user, inject, "Direct execution")).toList();
        ExecutableInject injection = new ExecutableInject(inject, contract, userInjectContexts);
        Injector executor = context.getBean(contract.getConfig().getType(), Injector.class);
        Execution execution = executor.executeDirectly(injection);
        return InjectStatus.fromExecution(execution, inject);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/injects/{injectId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteInject(@PathVariable String exerciseId, @PathVariable String injectId) {
        injectRepository.deleteById(injectId);
    }

    @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/activation")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject updateInjectActivation(@PathVariable String exerciseId,
                                         @PathVariable String injectId,
                                         @Valid @RequestBody InjectUpdateActivationInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        inject.setEnabled(input.isEnabled());
        return injectRepository.save(inject);
    }

    @Transactional(rollbackOn = Exception.class)
    @PostMapping("/api/exercises/{exerciseId}/injects/{injectId}/status")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject setInjectStatus(@PathVariable String exerciseId,
                                  @PathVariable String injectId,
                                  @Valid @RequestBody InjectUpdateStatusInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        // build status
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setDate(now());
        injectStatus.setName(input.getStatus());
        injectStatus.setExecutionTime(0);
        Execution execution = new Execution();
        execution.addTrace(traceSuccess(currentUser().getId(), input.getMessage()));
        execution.stop();
        injectStatus.setReporting(execution);
        // Save status for inject
        inject.setStatus(injectStatus);
        return injectRepository.save(inject);
    }

    @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/audiences")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject updateInjectAudiences(@PathVariable String exerciseId,
                                        @PathVariable String injectId,
                                        @Valid @RequestBody UpdateAudiencesInjectInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        Iterable<Audience> injectAudiences = audienceRepository.findAllById(input.getAudienceIds());
        inject.setAudiences(fromIterable(injectAudiences));
        return injectRepository.save(inject);
    }

    @GetMapping("/api/injects/next")
    public List<Inject> nextInjectsToExecute(@RequestParam Optional<Integer> size) {
        return injectRepository.findAll(InjectSpecification.next()).stream()
                // Keep only injects visible by the user
                .filter(inject -> inject.getDate().isPresent())
                .filter(inject -> inject.getExercise().isUserHasAccess(currentUser()))
                // Order by near execution
                .sorted(Inject.executionComparator)
                // Keep only the expected size
                .limit(size.orElse(MAX_NEXT_INJECTS))
                // Collect the result
                .toList();
    }
}
