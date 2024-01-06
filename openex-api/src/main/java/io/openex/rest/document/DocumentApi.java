package io.openex.rest.document;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openex.config.OpenexPrincipal;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.injects.challenge.model.ChallengeContent;
import io.openex.rest.document.form.DocumentCreateInput;
import io.openex.rest.document.form.DocumentTagUpdateInput;
import io.openex.rest.document.form.DocumentUpdateInput;
import io.openex.rest.helper.RestBehavior;
import io.openex.service.FileService;
import io.openex.service.InjectService;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static io.openex.config.OpenExAnonymous.ANONYMOUS;
import static io.openex.config.SessionHelper.currentUser;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.injects.challenge.ChallengeContract.CHALLENGE_PUBLISH;


@RestController
public class DocumentApi extends RestBehavior {

  private FileService fileService;
  private TagRepository tagRepository;
  private DocumentRepository documentRepository;
  private ExerciseRepository exerciseRepository;
  private InjectService injectService;
  private InjectDocumentRepository injectDocumentRepository;
  private ChallengeRepository challengeRepository;
  private UserRepository userRepository;

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setInjectDocumentRepository(InjectDocumentRepository injectDocumentRepository) {
    this.injectDocumentRepository = injectDocumentRepository;
  }

  @Autowired
  public void setInjectService(InjectService injectService) {
    this.injectService = injectService;
  }

  @Autowired
  public void setExerciseRepository(ExerciseRepository exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  @Autowired
  public void setTagRepository(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Autowired
  public void setDocumentRepository(DocumentRepository documentRepository) {
    this.documentRepository = documentRepository;
  }

  @Autowired
  public void setChallengeRepository(ChallengeRepository challengeRepository) {
    this.challengeRepository = challengeRepository;
  }

  @Autowired
  public void setFileService(FileService fileService) {
    this.fileService = fileService;
  }

  private Optional<Document> resolveDocument(String documentId) {
    OpenexPrincipal user = currentUser();
    if (user.isAdmin()) {
      return documentRepository.findById(documentId);
    } else {
      return documentRepository.findByIdGranted(documentId, user.getId());
    }
  }

  @PostMapping("/api/documents")
  public Document uploadDocument(@Valid @RequestPart("input") DocumentCreateInput input,
      @RequestPart("file") MultipartFile file) throws Exception {
    String extension = FilenameUtils.getExtension(file.getOriginalFilename());
    String fileTarget = DigestUtils.md5Hex(file.getInputStream()) + "." + extension;
    Optional<Document> targetDocument = documentRepository.findByTarget(fileTarget);
    if (targetDocument.isPresent()) {
      Document document = targetDocument.get();
      // Compute exercises
      if (!document.getExercises().isEmpty()) {
        List<Exercise> exercises = new ArrayList<>(document.getExercises());
        List<Exercise> inputExercises = fromIterable(exerciseRepository.findAllById(input.getExerciseIds()));
        inputExercises.forEach(inputExercise -> {
          if (!exercises.contains(inputExercise)) {
            exercises.add(inputExercise);
          }
        });
        document.setExercises(exercises);
      }
      // Compute tags
      List<Tag> tags = new ArrayList<>(document.getTags());
      List<Tag> inputTags = fromIterable(tagRepository.findAllById(input.getTagIds()));
      inputTags.forEach(inputTag -> {
        if (!tags.contains(inputTag)) {
          tags.add(inputTag);
        }
      });
      document.setTags(tags);
      return documentRepository.save(document);
    } else {
      fileService.uploadFile(fileTarget, file);
      Document document = new Document();
      document.setTarget(fileTarget);
      document.setName(file.getOriginalFilename());
      document.setDescription(input.getDescription());
      if (!input.getExerciseIds().isEmpty()) {
        document.setExercises(fromIterable(exerciseRepository.findAllById(input.getExerciseIds())));
      }
      document.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
      document.setType(file.getContentType());
      return documentRepository.save(document);
    }
  }

  @GetMapping("/api/documents")
  public List<Document> documents() {
    Sort sorting = Sort.by(Sort.Direction.DESC, "id");
    OpenexPrincipal user = currentUser();
    if (user.isAdmin()) {
      return documentRepository.findAll(null, sorting);
    } else {
      return documentRepository.findAllGranted(user.getId());
    }
  }

  @GetMapping("/api/documents/{documentId}")
  public Document document(@PathVariable String documentId) {
    return resolveDocument(documentId).orElseThrow();
  }

  @GetMapping("/api/documents/{documentId}/tags")
  public List<Tag> documentTags(@PathVariable String documentId) {
    Document document = resolveDocument(documentId).orElseThrow();
    return document.getTags();
  }

  @PutMapping("/api/documents/{documentId}/tags")
  public Document documentTags(@PathVariable String documentId, @RequestBody DocumentTagUpdateInput input) {
    Document document = resolveDocument(documentId).orElseThrow();
    document.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    return documentRepository.save(document);
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping("/api/documents/{documentId}")
  public Document updateDocumentInformation(@PathVariable String documentId,
      @Valid @RequestBody DocumentUpdateInput input) {
    Document document = resolveDocument(documentId).orElseThrow();
    document.setUpdateAttributes(input);
    document.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    // Get removed exercises
    Stream<String> askIdsStream = document.getExercises().stream()
        .filter(exercise -> !exercise.isUserHasAccess(userRepository.findById(currentUser().getId()).orElseThrow()))
        .map(Exercise::getId);
    List<String> askIds = Stream.concat(askIdsStream, input.getExerciseIds().stream()).distinct().toList();
    List<Exercise> removedExercises = document.getExercises().stream()
        .filter(exercise -> !askIds.contains(exercise.getId())).toList();
    document.setExercises(fromIterable(exerciseRepository.findAllById(askIds)));
    // In case of exercise removal, all inject doc attachment for exercise
    removedExercises.forEach(exercise -> injectService.cleanInjectsDocExercise(exercise.getId(), documentId));
    // Save and return
    return documentRepository.save(document);
  }

  @GetMapping("/api/documents/{documentId}/file")
  public void downloadDocument(@PathVariable String documentId, HttpServletResponse response) throws IOException {
    Document document = resolveDocument(documentId).orElseThrow();
    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + document.getName());
    response.addHeader(HttpHeaders.CONTENT_TYPE, document.getType());
    response.setStatus(HttpServletResponse.SC_OK);
    InputStream fileStream = fileService.getFile(document).orElseThrow();
    fileStream.transferTo(response.getOutputStream());
  }

  private List<Document> getExercisePlayerDocuments(Exercise exercise) {
    Stream<Document> channelsDocs = exercise.getArticles().stream()
        .map(Article::getChannel)
        .flatMap(channel -> channel.getLogos().stream());
    Stream<Document> articlesDocs = exercise.getArticles().stream()
        .flatMap(article -> article.getDocuments().stream());
    List<String> challenges = exercise.getInjects().stream()
        .filter(inject -> inject.getContract().equals(CHALLENGE_PUBLISH))
        .filter(inject -> inject.getContent() != null)
        .flatMap(inject -> {
          try {
            ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
            return content.getChallenges().stream();
          } catch (JsonProcessingException e) {
            return Stream.empty();
          }
        })
        .toList();
    Stream<Document> challengesDocs = fromIterable(challengeRepository.findAllById(challenges)).stream()
        .flatMap(challenge -> challenge.getDocuments().stream());
    return Stream.of(channelsDocs, articlesDocs, challengesDocs).flatMap(documentStream -> documentStream).distinct()
        .toList();
  }

  @GetMapping("/api/player/{exerciseId}/documents")
  public List<Document> playerDocuments(@PathVariable String exerciseId, @RequestParam Optional<String> userId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    if (!exercise.isUserHasAccess(user) && !exercise.getUsers().contains(user)) {
      throw new UnsupportedOperationException("The given player is not in this exercise");
    }
    return getExercisePlayerDocuments(exercise);
  }

  @GetMapping("/api/player/{exerciseId}/documents/{documentId}/file")
  public void downloadPlayerDocument(@PathVariable String exerciseId, @PathVariable String documentId,
      @RequestParam Optional<String> userId, HttpServletResponse response) throws IOException {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    if (!exercise.isUserHasAccess(user) && !exercise.getUsers().contains(user)) {
      throw new UnsupportedOperationException("The given player is not in this exercise");
    }
    Document document = getExercisePlayerDocuments(exercise).stream().filter(doc -> doc.getId().equals(documentId))
        .findFirst().orElseThrow();
    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + document.getName());
    response.addHeader(HttpHeaders.CONTENT_TYPE, document.getType());
    response.setStatus(HttpServletResponse.SC_OK);
    InputStream fileStream = fileService.getFile(document).orElseThrow();
    fileStream.transferTo(response.getOutputStream());
  }

  @Transactional(rollbackOn = Exception.class)
  @DeleteMapping("/api/documents/{documentId}")
  public void deleteDocument(@PathVariable String documentId) {
    injectDocumentRepository.deleteDocumentFromAllReferences(documentId);
    List<Document> documents = documentRepository.removeById(documentId);
    documents.forEach(document -> {
      try {
        fileService.deleteFile(document.getTarget());
      } catch (Exception e) {
        // Fail no longer available in the storage.
      }
    });
  }
}
