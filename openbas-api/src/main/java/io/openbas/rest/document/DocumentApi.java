package io.openbas.rest.document;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.specification.DocumentSpecification.findGrantedFor;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.*;
import io.openbas.database.raw.RawDocument;
import io.openbas.database.raw.RawPaginationDocument;
import io.openbas.database.repository.*;
import io.openbas.rest.document.form.DocumentCreateInput;
import io.openbas.rest.document.form.DocumentTagUpdateInput;
import io.openbas.rest.document.form.DocumentUpdateInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.service.FileService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class DocumentApi extends RestBehavior {

  private final TagRepository tagRepository;
  private final DocumentRepository documentRepository;
  private final ExerciseRepository exerciseRepository;
  private final ScenarioRepository scenarioRepository;
  private final UserRepository userRepository;
  private final InjectorRepository injectorRepository;
  private final CollectorRepository collectorRepository;
  private final SecurityPlatformRepository securityPlatformRepository;

  private final DocumentService documentService;
  private final FileService fileService;
  private final InjectService injectService;

  private Optional<Document> resolveDocument(String documentId) {
    OpenBASPrincipal user = currentUser();
    if (user.isAdmin()) {
      return documentRepository.findById(documentId);
    } else {
      return documentRepository.findByIdGranted(documentId, user.getId());
    }
  }

  @PostMapping("/api/documents")
  @Transactional(rollbackOn = Exception.class)
  public Document uploadDocument(
      @Valid @RequestPart("input") DocumentCreateInput input,
      @RequestPart("file") MultipartFile file)
      throws Exception {
    String extension = FilenameUtils.getExtension(file.getOriginalFilename());
    String fileTarget = DigestUtils.md5Hex(file.getInputStream()) + "." + extension;
    Optional<Document> targetDocument = documentRepository.findByTarget(fileTarget);
    if (targetDocument.isPresent()) {
      Document document = targetDocument.get();
      // Compute exercises
      if (!document.getExercises().isEmpty()) {
        Set<Exercise> exercises = new HashSet<>(document.getExercises());
        List<Exercise> inputExercises =
            fromIterable(exerciseRepository.findAllById(input.getExerciseIds()));
        exercises.addAll(inputExercises);
        document.setExercises(exercises);
      }
      // Compute scenarios
      if (!document.getScenarios().isEmpty()) {
        Set<Scenario> scenarios = new HashSet<>(document.getScenarios());
        List<Scenario> inputScenarios =
            fromIterable(scenarioRepository.findAllById(input.getScenarioIds()));
        scenarios.addAll(inputScenarios);
        document.setScenarios(scenarios);
      }
      // Compute tags
      Set<Tag> tags = new HashSet<>(document.getTags());
      List<Tag> inputTags = fromIterable(tagRepository.findAllById(input.getTagIds()));
      tags.addAll(inputTags);
      document.setTags(tags);
      return documentRepository.save(document);
    } else {
      fileService.uploadFile(fileTarget, file);
      Document document = new Document();
      document.setTarget(fileTarget);
      document.setName(file.getOriginalFilename());
      document.setDescription(input.getDescription());
      if (!input.getExerciseIds().isEmpty()) {
        document.setExercises(
            iterableToSet(exerciseRepository.findAllById(input.getExerciseIds())));
      }
      if (!input.getScenarioIds().isEmpty()) {
        document.setScenarios(
            iterableToSet(scenarioRepository.findAllById(input.getScenarioIds())));
      }
      document.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
      document.setType(file.getContentType());
      return documentRepository.save(document);
    }
  }

  @PostMapping("/api/documents/upsert")
  @Transactional(rollbackOn = Exception.class)
  public Document upsertDocument(
      @Valid @RequestPart("input") DocumentCreateInput input,
      @RequestPart("file") MultipartFile file)
      throws Exception {
    String extension = FilenameUtils.getExtension(file.getOriginalFilename());
    String fileTarget = DigestUtils.md5Hex(file.getInputStream()) + "." + extension;
    Optional<Document> targetDocument = documentRepository.findByTarget(fileTarget);
    // Document already exists by hash
    if (targetDocument.isPresent()) {
      Document document = targetDocument.get();
      // Compute exercises
      if (!document.getExercises().isEmpty()) {
        Set<Exercise> exercises = new HashSet<>(document.getExercises());
        List<Exercise> inputExercises =
            fromIterable(exerciseRepository.findAllById(input.getExerciseIds()));
        exercises.addAll(inputExercises);
        document.setExercises(exercises);
      }
      // Compute scenarios
      if (!document.getScenarios().isEmpty()) {
        Set<Scenario> scenarios = new HashSet<>(document.getScenarios());
        List<Scenario> inputScenarios =
            fromIterable(scenarioRepository.findAllById(input.getScenarioIds()));
        scenarios.addAll(inputScenarios);
        document.setScenarios(scenarios);
      }
      // Compute tags
      Set<Tag> tags = new HashSet<>(document.getTags());
      List<Tag> inputTags = fromIterable(tagRepository.findAllById(input.getTagIds()));
      tags.addAll(inputTags);
      document.setTags(tags);
      return documentRepository.save(document);
    } else {
      Optional<Document> existingDocument =
          documentRepository.findByName(file.getOriginalFilename());
      if (existingDocument.isPresent()) {
        Document document = existingDocument.get();
        // Update doc
        fileService.uploadFile(fileTarget, file);
        document.setDescription(input.getDescription());

        // Compute exercises
        if (!document.getExercises().isEmpty()) {
          Set<Exercise> exercises = new HashSet<>(document.getExercises());
          List<Exercise> inputExercises =
              fromIterable(exerciseRepository.findAllById(input.getExerciseIds()));
          exercises.addAll(inputExercises);
          document.setExercises(exercises);
        }
        // Compute scenarios
        if (!document.getScenarios().isEmpty()) {
          Set<Scenario> scenarios = new HashSet<>(document.getScenarios());
          List<Scenario> inputScenarios =
              fromIterable(scenarioRepository.findAllById(input.getScenarioIds()));
          scenarios.addAll(inputScenarios);
          document.setScenarios(scenarios);
        }
        // Compute tags
        Set<Tag> tags = new HashSet<>(document.getTags());
        List<Tag> inputTags = fromIterable(tagRepository.findAllById(input.getTagIds()));
        tags.addAll(inputTags);
        document.setTags(tags);
        return documentRepository.save(document);
      } else {
        fileService.uploadFile(fileTarget, file);
        Document document = new Document();
        document.setTarget(fileTarget);
        document.setName(file.getOriginalFilename());
        document.setDescription(input.getDescription());
        if (!input.getExerciseIds().isEmpty()) {
          document.setExercises(
              iterableToSet(exerciseRepository.findAllById(input.getExerciseIds())));
        }
        if (!input.getScenarioIds().isEmpty()) {
          document.setScenarios(
              iterableToSet(scenarioRepository.findAllById(input.getScenarioIds())));
        }
        document.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        document.setType(file.getContentType());
        return documentRepository.save(document);
      }
    }
  }

  @GetMapping("/api/documents")
  public List<RawDocument> documents() {
    OpenBASPrincipal user = currentUser();
    if (user.isAdmin()) {
      return documentRepository.rawAllDocuments();
    } else {
      return documentRepository.rawAllDocumentsByAccessLevel(user.getId());
    }
  }

  @PostMapping("/api/documents/search")
  public Page<RawPaginationDocument> searchDocuments(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    OpenBASPrincipal user = currentUser();
    List<Document> securityPlatformLogos = securityPlatformRepository.securityPlatformLogo();
    if (user.isAdmin()) {
      return buildPaginationJPA(
              (Specification<Document> specification, Pageable pageable) ->
                  this.documentRepository.findAll(specification, pageable),
              searchPaginationInput,
              Document.class)
          .map(
              (document) -> {
                var rawPaginationDocument = new RawPaginationDocument(document);
                rawPaginationDocument.setDocument_can_be_deleted(
                    !securityPlatformLogos.contains(document));
                return rawPaginationDocument;
              });
    } else {
      return buildPaginationJPA(
              (Specification<Document> specification, Pageable pageable) ->
                  this.documentRepository.findAll(
                      findGrantedFor(user.getId()).and(specification), pageable),
              searchPaginationInput,
              Document.class)
          .map(
              (document) -> {
                var rawPaginationDocument = new RawPaginationDocument(document);
                rawPaginationDocument.setDocument_can_be_deleted(
                    !securityPlatformLogos.contains(document));
                return rawPaginationDocument;
              });
    }
  }

  @GetMapping("/api/documents/{documentId}")
  public Document document(@PathVariable String documentId) {
    return resolveDocument(documentId)
        .orElseThrow(() -> new ElementNotFoundException("Document not found"));
  }

  @GetMapping("/api/documents/{documentId}/tags")
  public Set<Tag> documentTags(@PathVariable String documentId) {
    Document document =
        resolveDocument(documentId)
            .orElseThrow(() -> new ElementNotFoundException("Document not found"));
    return document.getTags();
  }

  @PutMapping("/api/documents/{documentId}/tags")
  public Document documentTags(
      @PathVariable String documentId, @RequestBody DocumentTagUpdateInput input) {
    Document document =
        resolveDocument(documentId)
            .orElseThrow(() -> new ElementNotFoundException("Document not found"));
    document.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
    return documentRepository.save(document);
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping("/api/documents/{documentId}")
  public Document updateDocumentInformation(
      @PathVariable String documentId, @Valid @RequestBody DocumentUpdateInput input) {
    Document document =
        resolveDocument(documentId)
            .orElseThrow(() -> new ElementNotFoundException("Document not found"));
    document.setUpdateAttributes(input);
    document.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));

    // Get removed exercises
    Stream<String> askExerciseIdsStream =
        document.getExercises().stream()
            .filter(
                exercise ->
                    !exercise.isUserHasAccess(
                        userRepository
                            .findById(currentUser().getId())
                            .orElseThrow(
                                () -> new ElementNotFoundException("Current user not found"))))
            .map(Exercise::getId);
    List<String> askExerciseIds =
        Stream.concat(askExerciseIdsStream, input.getExerciseIds().stream()).distinct().toList();
    List<Exercise> removedExercises =
        document.getExercises().stream()
            .filter(exercise -> !askExerciseIds.contains(exercise.getId()))
            .toList();
    document.setExercises(iterableToSet(exerciseRepository.findAllById(askExerciseIds)));
    // In case of exercise removal, all inject doc attachment for exercise
    removedExercises.forEach(
        exercise -> injectService.cleanInjectsDocExercise(exercise.getId(), documentId));

    // Get removed scenarios
    Stream<String> askScenarioIdsStream =
        document.getScenarios().stream()
            .filter(
                scenario ->
                    !scenario.isUserHasAccess(
                        userRepository
                            .findById(currentUser().getId())
                            .orElseThrow(
                                () -> new ElementNotFoundException("Current user not found"))))
            .map(Scenario::getId);
    List<String> askScenarioIds =
        Stream.concat(askScenarioIdsStream, input.getScenarioIds().stream()).distinct().toList();
    List<Scenario> removedScenarios =
        document.getScenarios().stream()
            .filter(scenario -> !askScenarioIds.contains(scenario.getId()))
            .toList();
    document.setScenarios(iterableToSet(scenarioRepository.findAllById(askScenarioIds)));
    // In case of scenario removal, all inject doc attachment for scenario
    removedScenarios.forEach(
        scenario -> injectService.cleanInjectsDocScenario(scenario.getId(), documentId));

    // Save and return
    return documentRepository.save(document);
  }

  @GetMapping("/api/documents/{documentId}/file")
  public void downloadDocument(@PathVariable String documentId, HttpServletResponse response)
      throws IOException {
    Document document =
        resolveDocument(documentId)
            .orElseThrow(() -> new ElementNotFoundException("Document not found"));
    response.addHeader(
        HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + document.getName());
    response.addHeader(HttpHeaders.CONTENT_TYPE, document.getType());
    response.setStatus(HttpServletResponse.SC_OK);
    try (InputStream fileStream =
        fileService
            .getFile(document)
            .orElseThrow(() -> new ElementNotFoundException("File not found"))) {
      fileStream.transferTo(response.getOutputStream());
    }
  }

  @GetMapping(value = "/api/images/injectors/{injectorType}", produces = MediaType.IMAGE_PNG_VALUE)
  public @ResponseBody ResponseEntity<byte[]> getInjectorImage(@PathVariable String injectorType)
      throws IOException {
    Optional<InputStream> fileStream = fileService.getInjectorImage(injectorType);
    if (fileStream.isPresent()) {
      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
          .body(IOUtils.toByteArray(fileStream.get()));
    }
    return null;
  }

  @GetMapping(value = "/api/images/injectors/id/{injectorId}", produces = MediaType.IMAGE_PNG_VALUE)
  public @ResponseBody ResponseEntity<byte[]> getInjectorImageFromId(
      @PathVariable String injectorId) throws IOException {
    Injector injector =
        this.injectorRepository
            .findById(injectorId)
            .orElseThrow(() -> new ElementNotFoundException("Injector not found"));
    Optional<InputStream> fileStream = fileService.getInjectorImage(injector.getType());
    if (fileStream.isPresent()) {
      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
          .body(IOUtils.toByteArray(fileStream.get()));
    }
    return null;
  }

  @GetMapping(
      value = "/api/images/collectors/{collectorType}",
      produces = MediaType.IMAGE_PNG_VALUE)
  public @ResponseBody ResponseEntity<byte[]> getCollectorImage(@PathVariable String collectorType)
      throws IOException {
    Optional<InputStream> fileStream = fileService.getCollectorImage(collectorType);
    if (fileStream.isPresent()) {
      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
          .body(IOUtils.toByteArray(fileStream.get()));
    }
    return null;
  }

  public void downloadCollectorImage(
      @PathVariable String collectorType, HttpServletResponse response) throws IOException {
    response.addHeader(
        HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + collectorType + ".png");
    response.addHeader(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE);
    response.setStatus(HttpServletResponse.SC_OK);
    try (InputStream fileStream =
        fileService
            .getCollectorImage(collectorType)
            .orElseThrow(() -> new ElementNotFoundException("File not found"))) {
      fileStream.transferTo(response.getOutputStream());
    }
  }

  @GetMapping(
      value = "/api/images/collectors/id/{collectorId}",
      produces = MediaType.IMAGE_PNG_VALUE)
  public @ResponseBody ResponseEntity<byte[]> getCollectorImageFromId(
      @PathVariable String collectorId) throws IOException {
    Collector collector =
        this.collectorRepository
            .findById(collectorId)
            .orElseThrow(() -> new ElementNotFoundException("Collector not found"));
    Optional<InputStream> fileStream = fileService.getCollectorImage(collector.getType());
    if (fileStream.isPresent()) {
      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
          .body(IOUtils.toByteArray(fileStream.get()));
    }
    return null;
  }

  @GetMapping(value = "/api/images/security_platforms/id/{assetId}/{theme}")
  public void getSecurityPlatformImageFromId(
      @PathVariable String assetId, @PathVariable String theme, HttpServletResponse response)
      throws IOException {
    SecurityPlatform securityPlatform =
        this.securityPlatformRepository
            .findById(assetId)
            .orElseThrow(() -> new ElementNotFoundException("Security platform not found"));
    if (theme.equals("dark") && securityPlatform.getLogoDark() != null) {
      downloadDocument(securityPlatform.getLogoDark().getId(), response);
    } else if (securityPlatform.getLogoLight() != null) {
      downloadDocument(securityPlatform.getLogoLight().getId(), response);
    } else {
      downloadCollectorImage("openbas_fake_detector", response);
    }
  }

  @GetMapping(
      value = "/api/images/executors/icons/{executorId}",
      produces = MediaType.IMAGE_PNG_VALUE)
  public @ResponseBody ResponseEntity<byte[]> getExecutorIconImage(@PathVariable String executorId)
      throws IOException {
    Optional<InputStream> fileStream = fileService.getExecutorIconImage(executorId);
    if (fileStream.isPresent()) {
      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
          .body(IOUtils.toByteArray(fileStream.get()));
    }
    return null;
  }

  @GetMapping(
      value = "/api/images/executors/banners/{executorId}",
      produces = MediaType.IMAGE_PNG_VALUE)
  public @ResponseBody ResponseEntity<byte[]> getExecutorBannerImage(
      @PathVariable String executorId) throws IOException {
    Optional<InputStream> fileStream = fileService.getExecutorBannerImage(executorId);
    if (fileStream.isPresent()) {
      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
          .body(IOUtils.toByteArray(fileStream.get()));
    }
    return null;
  }

  private List<Document> getExercisePlayerDocuments(Exercise exercise) {
    List<Article> articles = exercise.getArticles();
    List<Inject> injects = exercise.getInjects();
    return documentService.getPlayerDocuments(articles, injects);
  }

  private List<Document> getScenarioPlayerDocuments(Scenario scenario) {
    List<Article> articles = scenario.getArticles();
    List<Inject> injects = scenario.getInjects();
    return documentService.getPlayerDocuments(articles, injects);
  }

  @Transactional(rollbackOn = Exception.class)
  @DeleteMapping("/api/documents/{documentId}")
  public void deleteDocument(@PathVariable String documentId) {
    documentService.deleteDocument(documentId);
  }

  // -- EXERCISE & SENARIO--
  @GetMapping("/api/player/{exerciseOrScenarioId}/documents")
  public List<Document> playerDocuments(
      @PathVariable String exerciseOrScenarioId, @RequestParam Optional<String> userId) {
    Optional<Exercise> exerciseOpt = this.exerciseRepository.findById(exerciseOrScenarioId);
    Optional<Scenario> scenarioOpt = this.scenarioRepository.findById(exerciseOrScenarioId);

    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }

    if (exerciseOpt.isPresent()) {
      if (!exerciseOpt.get().isUserHasAccess(user)
          && !exerciseOpt.get().getUsers().contains(user)) {
        throw new UnsupportedOperationException("The given player is not in this exercise");
      }
      return getExercisePlayerDocuments(exerciseOpt.get());
    } else if (scenarioOpt.isPresent()) {
      if (!scenarioOpt.get().isUserHasAccess(user)
          && !scenarioOpt.get().getUsers().contains(user)) {
        throw new UnsupportedOperationException("The given player is not in this exercise");
      }
      return getScenarioPlayerDocuments(scenarioOpt.get());
    } else {
      throw new IllegalArgumentException("Exercise or scenario ID not found");
    }
  }

  @GetMapping("/api/player/{exerciseOrScenarioId}/documents/{documentId}/file")
  public void downloadPlayerDocument(
      @PathVariable String exerciseOrScenarioId,
      @PathVariable String documentId,
      @RequestParam Optional<String> userId,
      HttpServletResponse response)
      throws IOException {
    Optional<Exercise> exerciseOpt = this.exerciseRepository.findById(exerciseOrScenarioId);
    Optional<Scenario> scenarioOpt = this.scenarioRepository.findById(exerciseOrScenarioId);

    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }

    Document document = null;
    if (exerciseOpt.isPresent()) {
      if (!exerciseOpt.get().isUserHasAccess(user)
          && !exerciseOpt.get().getUsers().contains(user)) {
        throw new UnsupportedOperationException("The given player is not in this exercise");
      }
      document =
          getExercisePlayerDocuments(exerciseOpt.get()).stream()
              .filter(doc -> doc.getId().equals(documentId))
              .findFirst()
              .orElseThrow(() -> new ElementNotFoundException("Document not found"));
    } else if (scenarioOpt.isPresent()) {
      if (!scenarioOpt.get().isUserHasAccess(user)
          && !scenarioOpt.get().getUsers().contains(user)) {
        throw new UnsupportedOperationException("The given player is not in this exercise");
      }
      document =
          getScenarioPlayerDocuments(scenarioOpt.get()).stream()
              .filter(doc -> doc.getId().equals(documentId))
              .findFirst()
              .orElseThrow(() -> new ElementNotFoundException("Document not found"));
    }

    if (document != null) {
      response.addHeader(
          HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + document.getName());
      response.addHeader(HttpHeaders.CONTENT_TYPE, document.getType());
      response.setStatus(HttpServletResponse.SC_OK);
      try (InputStream fileStream =
          fileService
              .getFile(document)
              .orElseThrow(() -> new ElementNotFoundException("File not found"))) {
        fileStream.transferTo(response.getOutputStream());
      }
    }
  }
}
