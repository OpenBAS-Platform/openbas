package io.openbas.rest.executor;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.Executor;
import io.openbas.database.repository.ExecutorRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.executor.form.ExecutorCreateInput;
import io.openbas.rest.executor.form.ExecutorUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Instant;
import java.util.Optional;

import static io.openbas.database.model.User.ROLE_ADMIN;

@RestController
public class ExecutorApi extends RestBehavior {

    @Value("${info.app.version:unknown}") String version;

    private String JFROG_BASE = "https://filigran.jfrog.io/artifactory/openbas-agent/";
    private ExecutorRepository executorRepository;
    private EndpointService endpointService;
    private FileService fileService;

    @Resource
    protected ObjectMapper mapper;

    @Autowired
    public void setEndpointService(EndpointService endpointService) {
        this.endpointService = endpointService;
    }

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
    @Transactional(rollbackOn = Exception.class)
    public Executor registerExecutor(@Valid @RequestPart("input") ExecutorCreateInput input,
                                     @RequestPart("icon") Optional<MultipartFile> file) {
        try {
            // Upload icon
            if (file.isPresent() && "image/png".equals(file.get().getContentType())) {
                fileService.uploadFile(FileService.EXECUTORS_IMAGES_BASE_PATH + input.getType() + ".png", file.get());
            }
            // We need to support upsert for registration
            Executor executor = executorRepository.findById(input.getId()).orElse(null);
            if (executor == null) {
                Executor executorChecking = executorRepository.findByType(input.getType()).orElse(null);
                if (executorChecking != null) {
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

    @GetMapping(value = "/api/agent/caldera/{platform}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public @ResponseBody byte[] getCalderaAgent(@PathVariable String platform) throws IOException {
        InputStream in = getClass().getResourceAsStream("/agents/caldera/obas-" + platform);
        if (in != null) {
            return IOUtils.toByteArray(in);
        }
        return null;
    }

    // Public API
    @GetMapping(value = "/api/agent/executable/openbas/{platform}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public @ResponseBody ResponseEntity<byte[]> getOpenBasAgentExecutable(@PathVariable String platform) throws IOException {
        InputStream in = null;
        String filename = null;
        if (platform.equals("windows")) {
            filename = "openbas-agent-" + version + ".exe";
            in = getClass().getResourceAsStream("/agents/openbas/windows/" + filename);
            if (in == null) { // Dev mode, get from artifactory
                filename = "openbas-agent-latest.exe";
                in = new BufferedInputStream(new URL(JFROG_BASE + filename).openStream());
            }
        }
        if (platform.equals("linux")) {
            filename = "openbas-agent-" + version;
            in = getClass().getResourceAsStream("/agents/openbas/linux/" + filename);
            if (in == null) { // Dev mode, get from artifactory
                filename = "openbas-agent-latest";
                in = new BufferedInputStream(new URL(JFROG_BASE + filename).openStream());
            }
        }
        if (in != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(IOUtils.toByteArray(in));
        }
        throw new UnsupportedOperationException("Agent " + platform + " executable not supported");
    }

    // Public API
    @GetMapping(value = "/api/agent/package/openbas/{platform}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public @ResponseBody ResponseEntity<byte[]> getOpenBasAgentPackage(@PathVariable String platform) throws IOException {
        byte[] file = null;
        String filename = null;
        if (platform.equals("windows")) {
            filename = "openbas-agent-installer-" + version + ".exe";
            InputStream in = getClass().getResourceAsStream("/agents/openbas/windows/" + filename);
            if (in != null) {
                file = IOUtils.toByteArray(in);
            } else { // Dev mode, get from artifactory
                filename = "openbas-agent-installer-latest.exe";
                in = new BufferedInputStream(new URL(JFROG_BASE + filename).openStream());
                file = IOUtils.toByteArray(in);
            }
        }
        // linux - No package needed
        if (file != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(file);
        }
        throw new UnsupportedOperationException("Agent " + platform + " package not supported");
    }

    // Public API
    @GetMapping(value = "/api/agent/installer/openbas/{platform}")
    public @ResponseBody String getOpenBasAgentInstaller(@PathVariable String platform) throws IOException {
        return this.endpointService.generateInstallCommand(platform, ".");
    }
}
