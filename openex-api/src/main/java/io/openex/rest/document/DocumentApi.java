package io.openex.rest.document;

import io.openex.database.model.Document;
import io.openex.database.model.Exercise;
import io.openex.database.model.Tag;
import io.openex.database.model.User;
import io.openex.database.repository.DocumentRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectDocumentRepository;
import io.openex.database.repository.TagRepository;
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

import static io.openex.config.AppConfig.currentUser;

@RestController
public class DocumentApi extends RestBehavior {

    private FileService fileService;
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;
    private ExerciseRepository exerciseRepository;
    private InjectService injectService;
    private InjectDocumentRepository injectDocumentRepository;

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
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    private Optional<Document> resolveDocument(String documentId) {
        User user = currentUser();
        if (user.isAdmin()) {
            return documentRepository.findById(documentId);
        } else {
            return documentRepository.findByIdGranted(documentId, user.getId());
        }
    }

    @Transactional
    @PostMapping("/api/documents")
    public Document uploadDocument(@Valid @RequestPart("input") DocumentCreateInput input,
                                   @RequestPart("file") MultipartFile file) throws Exception {
        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        String fileTarget = DigestUtils.md5Hex(file.getInputStream()) + "." + extension;
        Optional<Document> targetDocument = documentRepository.findByTarget(fileTarget);
        if (targetDocument.isPresent()) {
            Document document = targetDocument.get();
            // Compute exercises
            List<Exercise> exercises = new ArrayList<>(document.getExercises());
            List<Exercise> inputExercises = fromIterable(exerciseRepository.findAllById(input.getExerciseIds()));
            inputExercises.forEach(inputExercise -> {
                if (!exercises.contains(inputExercise)) {
                    exercises.add(inputExercise);
                }
            });
            document.setExercises(exercises);
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
            document.setExercises(fromIterable(exerciseRepository.findAllById(input.getExerciseIds())));
            document.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
            document.setType(file.getContentType());
            return documentRepository.save(document);
        }
    }

    @GetMapping("/api/documents")
    public List<Document> documents() {
        Sort sorting = Sort.by(Sort.Direction.DESC, "id");
        User user = currentUser();
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
    public Document documentTags(@PathVariable String documentId,
                                 @RequestBody DocumentTagUpdateInput input) {
        Document document = resolveDocument(documentId).orElseThrow();
        document.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return documentRepository.save(document);
    }

    @Transactional
    @PutMapping("/api/documents/{documentId}")
    public Document updateDocumentInformation(@PathVariable String documentId,
                                              @Valid @RequestBody DocumentUpdateInput input) {
        Document document = resolveDocument(documentId).orElseThrow();
        document.setUpdateAttributes(input);
        document.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        // Get removed exercises
        Stream<String> askIdsStream = document.getExercises().stream()
                .filter(exercise -> !exercise.isUserHasAccess(currentUser())).map(Exercise::getId);
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

    @Transactional
    @DeleteMapping("/api/documents/{documentId}")
    public void deleteDocument(@PathVariable String documentId) throws Exception {
        Document document = resolveDocument(documentId).orElseThrow();
        fileService.deleteFile(document.getTarget());
        injectDocumentRepository.deleteAll(document.getDocuments());
        documentRepository.delete(document);
    }
}
