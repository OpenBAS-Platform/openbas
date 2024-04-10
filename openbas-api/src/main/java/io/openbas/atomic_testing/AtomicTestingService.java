package io.openbas.atomic_testing;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.User;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Executor;
import io.openbas.atomic_testing.form.AtomicTestingInput;
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
  private InjectRepository injectRepository;
  private InjectDocumentRepository injectDocumentRepository;
  private UserRepository userRepository;
  private TeamRepository teamRepository;
  private TagRepository tagRepository;
  private DocumentRepository documentRepository;

  @Autowired
  public void setExecutor(Executor executor) {
    this.executor = executor;
  }

  @Autowired
  public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
    this.executionContextService = executionContextService;
  }

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {
    this.injectRepository = injectRepository;
  }

  @Autowired
  public void setInjectDocumentRepository(InjectDocumentRepository injectDocumentRepository) {
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
  public Inject createOrUpdate(AtomicTestingInput input) {
    Inject inject = input.toInject();

    inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
    inject.setExercise(null);
    // Set dependencies
    inject.setDependsOn(null);
    inject.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
    inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    List<InjectDocument> injectDocuments = input.getDocuments().stream()
        .map(i -> {
          InjectDocument injectDocument = new InjectDocument();
          injectDocument.setInject(inject);
          injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow());
          injectDocument.setAttached(i.isAttached());
          return injectDocument;
        }).toList();
    inject.setDocuments(injectDocuments);
    return injectRepository.save(inject);
  }

  public InjectStatus tryInject(String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    User user = this.userRepository.findById(currentUser().getId()).orElseThrow();
    List<ExecutionContext> userInjectContexts = List.of(
        this.executionContextService.executionContext(user, inject, "Direct test")
    );
    ExecutableInject injection = new ExecutableInject(false, true, inject, List.of(), inject.getAssets(),
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
