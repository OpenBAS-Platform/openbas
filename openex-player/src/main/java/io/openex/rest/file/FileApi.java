package io.openex.rest.file;

import io.openex.database.model.File;
import io.openex.database.repository.FileRepository;
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

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;

import java.util.List;

import static io.openex.database.model.User.ROLE_USER;

@RestController
public class FileApi extends RestBehavior {

    private FileService fileService;
    private FileRepository fileRepository;

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    @Autowired
    public void setFileRepository(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    @RolesAllowed(ROLE_USER)
    @PostMapping("/api/files")
    @Transactional
    public File upload(@RequestPart("file") MultipartFile file) throws Exception {
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
        return fileRepository.findAll(null, Sort.by(Sort.Direction.DESC, "id"));
    }

    @DeleteMapping("/api/files/{fileId}")
    public void delete(@PathVariable String fileId) {
        fileRepository.deleteById(fileId);
    }
}
