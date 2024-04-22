package io.openbas.atomic_testing;

import io.openbas.atomic_testing.form.AtomicTestingDetailOutput;
import io.openbas.atomic_testing.form.AtomicTestingInput;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Executor;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@Service
public class AtomicTestingService {

  private Executor executor;
  private ExecutionContextService executionContextService;

  private AssetGroupRepository assetGroupRepository;

  private AssetRepository assetRepository;
  private InjectRepository injectRepository;
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
    injectToSave.setTitle(input.getTitle());
    injectToSave.setContent(input.getContent());
    injectToSave.setType(input.getType());
    injectToSave.setInjectorContract(this.injectorContractRepository.findById(input.getContract()).orElseThrow());
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

  @Transactional
  public InjectStatus tryInject(String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    User user = this.userRepository.findById(currentUser().getId()).orElseThrow();

    // Reset injects outcome, communications and expectations
    inject.clean();

    List<ExecutionContext> userInjectContexts = List.of(
        this.executionContextService.executionContext(user, inject, "Direct test")
    );
    ExecutableInject injection = new ExecutableInject(false, true, inject, inject.getTeams(), inject.getAssets(),
        inject.getAssetGroups(), userInjectContexts);
    // TODO Must be migrated to Atomic approach (Inject duplication and async tracing)
    return executor.execute(injection);
  }

  @Transactional
  public void deleteAtomicTesting(String injectId) {
    injectDocumentRepository.deleteDocumentsFromInject(injectId);
    injectRepository.deleteById(injectId);
  }
}
