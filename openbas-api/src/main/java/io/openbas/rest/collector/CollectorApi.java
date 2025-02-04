package io.openbas.rest.collector;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static java.util.Optional.ofNullable;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Collector;
import io.openbas.database.model.SecurityPlatform;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.database.repository.SecurityPlatformRepository;
import io.openbas.rest.collector.form.CollectorCreateInput;
import io.openbas.rest.collector.form.CollectorUpdateInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class CollectorApi extends RestBehavior {

  private CollectorRepository collectorRepository;

  private FileService fileService;

  private SecurityPlatformRepository securityPlatformRepository;

  @Resource protected ObjectMapper mapper;

  @Autowired
  public void setFileService(FileService fileService) {
    this.fileService = fileService;
  }

  @Autowired
  public void setCollectorRepository(CollectorRepository collectorRepository) {
    this.collectorRepository = collectorRepository;
  }

  @Autowired
  public void setSecurityPlatformRepository(SecurityPlatformRepository securityPlatformRepository) {
    this.securityPlatformRepository = securityPlatformRepository;
  }

  @GetMapping("/api/collectors")
  public Iterable<Collector> collectors() {
    return collectorRepository.findAll();
  }

  private Collector updateCollector(
      Collector collector,
      String type,
      String name,
      int period,
      Instant lastExecution,
      String securityPlatform) {
    collector.setUpdatedAt(Instant.now());
    collector.setExternal(true);
    collector.setType(type);
    collector.setName(name);
    collector.setPeriod(period);
    collector.setLastExecution(lastExecution);
    if (securityPlatform != null) {
      collector.setSecurityPlatform(
          securityPlatformRepository.findById(securityPlatform).orElseThrow());
    }
    return collectorRepository.save(collector);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/collectors/{collectorId}")
  @Transactional(rollbackOn = Exception.class)
  public Collector updateCollector(
      @PathVariable String collectorId, @Valid @RequestBody CollectorUpdateInput input) {
    Collector collector =
        collectorRepository.findById(collectorId).orElseThrow(ElementNotFoundException::new);
    return updateCollector(
        collector,
        collector.getType(),
        collector.getName(),
        collector.getPeriod(),
        input.getLastExecution(),
        ofNullable(collector.getSecurityPlatform()).map(SecurityPlatform::getId).orElse(null));
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(
      value = "/api/collectors",
      produces = {MediaType.APPLICATION_JSON_VALUE},
      consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
  @Transactional(rollbackOn = Exception.class)
  public Collector registerCollector(
      @Valid @RequestPart("input") CollectorCreateInput input,
      @RequestPart("icon") Optional<MultipartFile> file) {
    try {
      // Upload icon
      if (file.isPresent() && "image/png".equals(file.get().getContentType())) {
        fileService.uploadFile(
            FileService.COLLECTORS_IMAGES_BASE_PATH + input.getType() + ".png", file.get());
      }
      // We need to support upsert for registration
      Collector collector = collectorRepository.findById(input.getId()).orElse(null);
      if (collector == null) {
        Collector collectorChecking = collectorRepository.findByType(input.getType()).orElse(null);
        if (collectorChecking != null) {
          throw new Exception(
              "The collector "
                  + input.getType()
                  + " already exists with a different ID, please delete it or contact your administrator.");
        }
      }
      if (collector != null) {
        return updateCollector(
            collector,
            input.getType(),
            input.getName(),
            input.getPeriod(),
            collector.getLastExecution(),
            input.getSecurityPlatform());
      } else {
        // save the injector
        Collector newCollector = new Collector();
        newCollector.setId(input.getId());
        return updateCollector(
            newCollector,
            input.getType(),
            input.getName(),
            input.getPeriod(),
            null,
            input.getSecurityPlatform());
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
