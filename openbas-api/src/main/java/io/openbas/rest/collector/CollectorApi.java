package io.openbas.rest.collector;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Collector;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.rest.collector.form.CollectorCreateInput;
import io.openbas.rest.collector.form.CollectorUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Optional;

import static io.openbas.database.model.User.ROLE_ADMIN;

@RestController
public class CollectorApi extends RestBehavior {

    @Resource
    private OpenBASConfig openBASConfig;

    private CollectorRepository collectorRepository;

    private FileService fileService;

    @Resource
    protected ObjectMapper mapper;

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    @Autowired
    public void setCollectorRepository(CollectorRepository collectorRepository) {
        this.collectorRepository = collectorRepository;
    }

    @GetMapping("/api/collectors")
    public Iterable<Collector> collectors() {
        return collectorRepository.findAll();
    }

    private Collector updateCollector(Collector collector, String id, String type, String name, int period, Instant lastExecution) {
        collector.setUpdatedAt(Instant.now());
        collector.setId(id);
        collector.setExternal(true);
        collector.setType(type);
        collector.setName(name);
        collector.setPeriod(period);
        collector.setLastExecution(lastExecution);
        return collectorRepository.save(collector);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/collectors/{collectorId}")
    public Collector updateCollector(@PathVariable String collectorId, @Valid @RequestBody CollectorUpdateInput input) {
        Collector collector = collectorRepository.findById(collectorId).orElseThrow();
        return updateCollector(collector, collectorId, collector.getType(), collector.getName(), collector.getPeriod(), input.getLastExecution());
    }

    @Secured(ROLE_ADMIN)
    @PostMapping(value = "/api/collectors",
            produces = {MediaType.APPLICATION_JSON_VALUE},
            consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    public Collector registerCollector(@Valid @RequestPart("input") CollectorCreateInput input,
                                                 @RequestPart("icon") Optional<MultipartFile> file) {
        try {
            // Upload icon
            if (file.isPresent() && "image/png".equals(file.get().getContentType())) {
                fileService.uploadFile(FileService.COLLECTORS_IMAGES_BASE_PATH + input.getType() + ".png", file.get());
            }
            // We need to support upsert for registration
            Collector collector = collectorRepository.findById(input.getId()).orElse(collectorRepository.findByType(input.getType()).orElse(null));
            if (collector != null) {
                return updateCollector(collector, input.getId(), input.getType(), input.getName(), input.getPeriod(), collector.getLastExecution());
            } else {
                // save the injector
                Collector newCollector = new Collector();
                newCollector.setId(input.getId());
                newCollector.setExternal(true);
                newCollector.setName(input.getName());
                newCollector.setType(input.getType());
                newCollector.setPeriod(input.getPeriod());
                return collectorRepository.save(newCollector);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
