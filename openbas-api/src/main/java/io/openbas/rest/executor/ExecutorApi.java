package io.openbas.rest.executor;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Executor;
import io.openbas.database.repository.ExecutorRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.executor.form.ExecutorCreateInput;
import io.openbas.rest.executor.form.ExecutorUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.Optional;

import static io.openbas.database.model.User.ROLE_ADMIN;

@RestController
public class ExecutorApi extends RestBehavior {

    private ExecutorRepository executorRepository;

    private FileService fileService;

    @Resource
    protected ObjectMapper mapper;

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    @Autowired
    public void setExecutorRepository(ExecutorRepository executorRepository) {
        this.executorRepository = executorRepository;
    }

    @GetMapping("/api/executors")
    public Iterable<Executor> executors() {
        return executorRepository.findAll();
    }

    private Executor updateExecutor(Executor executor, String type, String name, String[] platforms) {
        executor.setUpdatedAt(Instant.now());
        executor.setType(type);
        executor.setName(name);
        executor.setPlatforms(platforms);
        return executorRepository.save(executor);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/executors/{executorId}")
    public Executor updateExecutor(@PathVariable String executorId, @Valid @RequestBody ExecutorUpdateInput input) {
        Executor executor = executorRepository.findById(executorId).orElseThrow(ElementNotFoundException::new);
        return updateExecutor(executor, executor.getType(), executor.getName(), executor.getPlatforms());
    }

    @Secured(ROLE_ADMIN)
    @PostMapping(value = "/api/executors",
            produces = {MediaType.APPLICATION_JSON_VALUE},
            consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    public Executor registerExecutor(@Valid @RequestPart("input") ExecutorCreateInput input,
                                       @RequestPart("icon") Optional<MultipartFile> file) {
        try {
            // Upload icon
            if (file.isPresent() && "image/png".equals(file.get().getContentType())) {
                fileService.uploadFile(FileService.EXECUTORS_IMAGES_BASE_PATH + input.getType() + ".png", file.get());
            }
            // We need to support upsert for registration
            Executor executor = executorRepository.findById(input.getId()).orElse(null);
            if( executor == null ) {
                Executor executorChecking = executorRepository.findByType(input.getType()).orElse(null);
                if (executorChecking != null ) {
                    throw new Exception("The executor " + input.getType() + " already exists with a different ID, please delete it or contact your administrator.");
                }
            }
            if (executor != null) {
                return updateExecutor(executor, input.getType(), input.getName(), input.getPlatforms());
            } else {
                // save the injector
                Executor newExecutor = new Executor();
                newExecutor.setId(input.getId());
                newExecutor.setName(input.getName());
                newExecutor.setType(input.getType());
                newExecutor.setPlatforms(input.getPlatforms());
                return executorRepository.save(newExecutor);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping(value = "/api/agent/{platform}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public void getAgent(@PathVariable String platform, HttpServletResponse response) throws IOException {
        response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=obas-" + platform);
        response.addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        response.setStatus(HttpServletResponse.SC_OK);
        InputStream fileStream = getClass().getResourceAsStream("/agents/obas-" + platform);
        if (fileStream != null) {
            fileStream.transferTo(response.getOutputStream());
        } else {
            throw new ElementNotFoundException();
        }
    }
}
