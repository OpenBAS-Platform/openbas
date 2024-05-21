package io.openbas.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Executor;
import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.ContractType;
import io.openbas.injector_contract.fields.ContractElement;
import io.openbas.injector_contract.fields.ContractExpectations;
import io.openbas.injectors.channel.model.ChannelContent;
import io.openbas.rest.atomic_testing.form.AtomicTestingInput;
import io.openbas.rest.atomic_testing.form.AtomicTestingUpdateTagsInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@Service
@Log
public class AtomicTestingService {
    @Resource
    protected ObjectMapper mapper;

    private Executor executor;
    private ExecutionContextService executionContextService;

    private AssetGroupRepository assetGroupRepository;

    private AssetRepository assetRepository;
    private InjectRepository injectRepository;
    private InjectStatusRepository injectStatusRepository;
    private InjectorContractRepository injectorContractRepository;
    private InjectDocumentRepository injectDocumentRepository;
    private UserRepository userRepository;
    private TeamRepository teamRepository;
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;

    @Autowired
    public void setExecutor(@NotNull final Executor executor) {
        this.executor = executor;
    }

    @Autowired
    public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
        this.executionContextService = executionContextService;
    }

    @Autowired
    public void setInjectRepository(@NotNull final InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setInjectStatusRepository(@NotNull final InjectStatusRepository injectStatusRepository) {
        this.injectStatusRepository = injectStatusRepository;
    }

    @Autowired
    public void setAssetRepository(@NotNull final AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Autowired
    public void setAssetGroupRepository(@NotNull final AssetGroupRepository assetGroupRepository) {
        this.assetGroupRepository = assetGroupRepository;
    }

    @Autowired
    public void setInjectDocumentRepository(@NotNull final InjectDocumentRepository injectDocumentRepository) {
        this.injectDocumentRepository = injectDocumentRepository;
    }

    @Autowired
    public void setUserRepository(@NotNull final UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setTeamRepository(@NotNull final TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Autowired
    public void setTagRepository(@NotNull final TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setDocumentRepository(@NotNull final DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Autowired
    public void setInjectorContractRepository(@NotNull final InjectorContractRepository injectorContractRepository) {
        this.injectorContractRepository = injectorContractRepository;
    }

    public Page<Inject> findAllAtomicTestings(SearchPaginationInput searchPaginationInput) {
        Specification<Inject> customSpec = Specification.where((root, query, cb) -> {
            Predicate predicate = cb.conjunction();
            predicate = cb.and(predicate, cb.isNull(root.get("scenario")));
            predicate = cb.and(predicate, cb.isNull(root.get("exercise")));
            return predicate;
        });
        return buildPaginationJPA(
                (Specification<Inject> specification, Pageable pageable) -> injectRepository.findAll(
                        specification.and(customSpec), pageable),
                searchPaginationInput,
                Inject.class
        );
    }

    public Optional<Inject> findById(String injectId) {
        return injectRepository.findWithStatusById(injectId);
    }

    @Transactional
    public Inject createOrUpdate(AtomicTestingInput input, String injectId) {
        Inject injectToSave = new Inject();
        if (injectId != null) {
            injectToSave = injectRepository.findById(injectId).orElseThrow();
        }

        InjectorContract injectorContract = injectorContractRepository.findById(input.getInjectorContract()).orElseThrow();
        ObjectNode finalContent = input.getContent();
        // Set expectations
        if (injectId == null) {
            if (input.getContent() == null || input.getContent().get("expectations") == null || input.getContent().get("expectations").isEmpty()) {
                try {
                    JsonNode jsonNode = mapper.readTree(injectorContract.getContent());
                    List<JsonNode> contractElements = StreamSupport.stream(jsonNode.get("fields").spliterator(), false).filter(contractElement -> contractElement.get("type").asText().equals(ContractType.Expectation.name().toLowerCase())).toList();
                    if (!contractElements.isEmpty()) {
                        JsonNode contractElement = contractElements.getFirst();
                        if (!contractElement.get("predefinedExpectations").isNull() && !contractElement.get("predefinedExpectations").isEmpty()) {
                            finalContent = finalContent != null ? finalContent : mapper.createObjectNode();
                            ArrayNode predefinedExpectations = mapper.createArrayNode();
                            StreamSupport.stream(contractElement.get("predefinedExpectations").spliterator(), false).forEach(predefinedExpectation -> {
                                ObjectNode newExpectation = predefinedExpectation.deepCopy();
                                newExpectation.put("expectation_score", 100);
                                predefinedExpectations.add(newExpectation);
                            });
                            finalContent.put("expectations", predefinedExpectations);
                        }
                    }
                } catch (JsonProcessingException e) {
                    log.severe("Cannot open injector contract");
                }
            }
        }
        injectToSave.setTitle(input.getTitle());
        injectToSave.setContent(finalContent);
        injectToSave.setInjectorContract(injectorContract);
        injectToSave.setAllTeams(input.isAllTeams());
        injectToSave.setDescription(input.getDescription());
        injectToSave.setDependsDuration(0L);
        injectToSave.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
        injectToSave.setExercise(null);

        // Set dependencies
        injectToSave.setDependsOn(null);
        injectToSave.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
        injectToSave.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        injectToSave.setAssets(fromIterable(this.assetRepository.findAllById(input.getAssets())));
        injectToSave.setAssetGroups(fromIterable(this.assetGroupRepository.findAllById(input.getAssetGroups())));

        List<String> previousDocumentIds = injectToSave
                .getDocuments()
                .stream()
                .map(InjectDocument::getDocument)
                .map(Document::getId)
                .toList();

        Inject finalInjectToSave = injectToSave;
        List<InjectDocument> injectDocuments = input.getDocuments().stream()
                .map(i -> {
                    if (!previousDocumentIds.contains(i.getDocumentId())) {
                        InjectDocument injectDocument = new InjectDocument();
                        injectDocument.setInject(finalInjectToSave);
                        injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow());
                        injectDocument.setAttached(i.isAttached());
                        return injectDocument;
                    }
                    return null;
                }).filter(Objects::nonNull).toList();
        injectToSave.getDocuments().addAll(injectDocuments);
        return injectRepository.save(injectToSave);
    }

    public Inject updateAtomicTestingTags(String injectId, AtomicTestingUpdateTagsInput input) {

        Inject inject = injectRepository.findById(injectId).orElseThrow();
        inject.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));

        return injectRepository.save(inject);
    }

    @Transactional
    public Inject tryInject(String injectId) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        User user = this.userRepository.findById(currentUser().getId()).orElseThrow();

        // Reset injects outcome, communications and expectations
        inject.clean();

        // New inject status
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setTrackingSentDate(Instant.now());
        injectStatus.setName(ExecutionStatus.QUEUING);
        this.injectStatusRepository.save(injectStatus);

        // Return inject
        return this.injectRepository.save(inject);
    }

    @Transactional
    public void deleteAtomicTesting(String injectId) {
        injectDocumentRepository.deleteDocumentsFromInject(injectId);
        injectRepository.deleteById(injectId);
    }
}
