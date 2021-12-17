package io.openex.rest.file;

import io.openex.database.model.Document;
import io.openex.database.model.File;
import io.openex.database.model.Tag;
import io.openex.database.repository.DocumentRepository;
import io.openex.database.repository.FileRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.specification.DocumentSpecification;
import io.openex.database.specification.FileSpecification;
import io.openex.rest.file.form.DocumentTagUpdateInput;
import io.openex.rest.file.form.DocumentUpdateInput;
import io.openex.rest.helper.RestBehavior;
import io.openex.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;

@RestController
public class FileApi extends RestBehavior {

    private FileService fileService;
    private FileRepository fileRepository;
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;

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

    @Autowired
    public void setFileRepository(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    // region files
    @Transactional
    @PostMapping("/api/files")
    public File uploadFile(@RequestPart("file") MultipartFile file) throws Exception {
        fileService.uploadFile(file);
        File save = new File();
        save.setName(file.getOriginalFilename());
        save.setPath("minio");
        save.setType(file.getContentType());
        return fileRepository.save(save);
    }

    @GetMapping("/api/files/{fileId}")
    public ResponseEntity<InputStreamResource> read(@PathVariable String fileId) throws Exception {
        File file = fileRepository.findById(fileId).orElseThrow();
        InputStreamResource inputStream = fileService.getFile(file.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + file.getName())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(inputStream);
    }

    @GetMapping("/api/files")
    public List<File> files() {
        return fileRepository.findAll(FileSpecification.onlyMinio(), Sort.by(Sort.Direction.DESC, "id"));
    }

    @DeleteMapping("/api/files/{fileId}")
    public void delete(@PathVariable String fileId) {
        fileRepository.deleteById(fileId);
    }
    // endregion

    // region documents
    @Transactional
    @PostMapping("/api/documents")
    public Document uploadDocument(@RequestPart("file") MultipartFile file) throws Exception {
        fileService.uploadFile(file);
        Document save = new Document();
        save.setName(file.getOriginalFilename());
        save.setPath("minio");
        save.setType(file.getContentType());
        return documentRepository.save(save);
    }

    @GetMapping("/api/documents")
    public List<Document> documents() {
        return documentRepository.findAll(DocumentSpecification.onlyMinio(), Sort.by(Sort.Direction.DESC, "id"));
    }

    @GetMapping("/api/documents/{documentId}/tags")
    public List<Tag> documentTags(@PathVariable String documentId) {
        Document document = documentRepository.findById(documentId).orElseThrow();
        return document.getTags();
    }

    @PutMapping("/api/documents/{documentId}/tags")
    public Document documentTags(@PathVariable String documentId, @RequestBody DocumentTagUpdateInput input) {
        Document document = documentRepository.findById(documentId).orElseThrow();
        document.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return documentRepository.save(document);
    }

    @PutMapping("/api/documents/{documentId}")
    public Document updateDocumentInformation(@PathVariable String documentId, @Valid @RequestBody DocumentUpdateInput input) {
        Document document = documentRepository.findById(documentId).orElseThrow();
        document.setUpdateAttributes(input);
        return documentRepository.save(document);
    }
    // endregion
}
