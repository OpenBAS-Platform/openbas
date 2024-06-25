package io.openbas.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.injector_contract.ContractType;
import io.openbas.rest.atomic_testing.form.AtomicTestingInput;
import io.openbas.rest.atomic_testing.form.AtomicTestingUpdateTagsInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
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
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.AtomicTestingUtils.copyInject;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RequiredArgsConstructor
@Service
@Log
public class AtomicTestingService {
    @Resource
    protected ObjectMapper mapper;

    private final AssetGroupRepository assetGroupRepository;

    private final AssetRepository assetRepository;
    private final InjectRepository injectRepository;
    private final InjectStatusRepository injectStatusRepository;
    private final InjectorContractRepository injectorContractRepository;
    private final InjectDocumentRepository injectDocumentRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TagRepository tagRepository;
    private final DocumentRepository documentRepository;

    private static final String PRE_DEFINE_EXPECTATIONS = "predefinedExpectations";
    private static final String EXPECTATIONS = "expectations";

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

        if (StringUtils.isNotBlank(input.getId())) {
            return getDuplicateAtomicTesting(input.getId());
        }
        InjectorContract injectorContract =
                injectorContractRepository.findById(input.getInjectorContract()).orElseThrow();
        ObjectNode finalContent = input.getContent();
        // Set expectations
        if (injectId == null) {
            finalContent = setExpectations(input, injectorContract, finalContent);
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
        injectToSave.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
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

    private ObjectNode setExpectations(AtomicTestingInput input, InjectorContract injectorContract, ObjectNode finalContent) {
        if (input.getContent() == null || input.getContent().get(EXPECTATIONS) == null
                || input.getContent().get(EXPECTATIONS).isEmpty()) {
            try {
                JsonNode jsonNode = mapper.readTree(injectorContract.getContent());
                List<JsonNode> contractElements =
                        StreamSupport.stream(jsonNode.get("fields").spliterator(), false)
                                .filter(contractElement -> contractElement.get("type").asText()
                                        .equals(ContractType.Expectation.name().toLowerCase())).toList();
                if (!contractElements.isEmpty()) {
                    JsonNode contractElement = contractElements.getFirst();
                    if (!contractElement.get(PRE_DEFINE_EXPECTATIONS).isNull() && !contractElement.get(PRE_DEFINE_EXPECTATIONS).isEmpty()) {
                        finalContent = finalContent != null ? finalContent : mapper.createObjectNode();
                        ArrayNode predefinedExpectations = mapper.createArrayNode();
                        StreamSupport.stream(contractElement.get(PRE_DEFINE_EXPECTATIONS).spliterator(), false).forEach(predefinedExpectation -> {
                            ObjectNode newExpectation = predefinedExpectation.deepCopy();
                            newExpectation.put("expectation_score", 100);
                            predefinedExpectations.add(newExpectation);
                        });
                        finalContent.putIfAbsent(EXPECTATIONS, predefinedExpectations);
                    }
                }
            } catch (JsonProcessingException e) {
                log.severe("Cannot open injector contract");
            }
        }
        return finalContent;
    }

    private Inject getDuplicateAtomicTesting(String id) {
        // We retrieve the original atomic testing (inject)
        Inject injectOrigin = injectRepository.findById(id).orElseThrow(ElementNotFoundException::new);

        Inject injectDuplicate = copyInject(injectOrigin);

        return injectRepository.save(injectDuplicate);
    }

    public Inject updateAtomicTestingTags(String injectId, AtomicTestingUpdateTagsInput input) {

        Inject inject = injectRepository.findById(injectId).orElseThrow();
        inject.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));

        return injectRepository.save(inject);
    }

    @Transactional
    public Inject tryInject(String injectId) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();

        // Reset injects outcome, communications and expectations
        inject.clean();
        inject.setUpdatedAt(Instant.now());

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
