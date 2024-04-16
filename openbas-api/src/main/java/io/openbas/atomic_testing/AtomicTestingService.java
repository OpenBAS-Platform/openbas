package io.openbas.atomic_testing;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.atomic_testing.form.AtomicTestingInput;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.User;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Executor;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AtomicTestingService {

  private Executor executor;
  private ExecutionContextService executionContextService;

  private AssetGroupRepository assetGroupRepository;

  private AssetRepository assetRepository;
  private InjectRepository injectRepository;
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

  public List<Inject> findAllAtomicTestings() {
    return this.injectRepository.findAllAtomicTestings();
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

    injectToSave.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
    injectToSave.setExercise(null);
    // Set dependencies
    injectToSave.setDependsOn(null);
    injectToSave.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
    injectToSave.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    Inject finalInjectToSave = injectToSave;
    List<InjectDocument> injectDocuments = input.getDocuments().stream()
        .map(i -> {
          InjectDocument injectDocument = new InjectDocument();
          injectDocument.setInject(finalInjectToSave);
          injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow());
          injectDocument.setAttached(i.isAttached());
          return injectDocument;
        }).toList();
    injectToSave.setDocuments(injectDocuments);
    injectToSave.setAssets(fromIterable(this.assetRepository.findAllById(input.getAssets())));
    injectToSave.setAssetGroups(fromIterable(this.assetGroupRepository.findAllById(input.getAssetGroups())));
    injectToSave.setDescription(input.getDescription());
    injectToSave.setTitle(input.getTitle());
    injectToSave.setContent(input.getContent());
    return injectRepository.save(injectToSave);
  }

  @Transactional
  public InjectStatus tryInject(String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    User user = this.userRepository.findById(currentUser().getId()).orElseThrow();
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
