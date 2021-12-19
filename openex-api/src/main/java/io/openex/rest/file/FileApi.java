package io.openex.rest.file;

import io.openex.database.model.Document;
import io.openex.database.model.Tag;
import io.openex.database.repository.DocumentRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.specification.DocumentSpecification;
import io.openex.rest.file.form.DocumentTagUpdateInput;
import io.openex.rest.file.form.DocumentUpdateInput;
import io.openex.rest.helper.RestBehavior;
import io.openex.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;

@RestController
public class FileApi extends RestBehavior {

    private FileService fileService;
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
