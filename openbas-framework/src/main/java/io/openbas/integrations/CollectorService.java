package io.openbas.integrations;

import static io.openbas.service.FileService.COLLECTORS_IMAGES_BASE_PATH;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Collector;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CollectorService {

  @Resource protected ObjectMapper mapper;

  private FileService fileService;

  private CollectorRepository collectorRepository;

  @Resource
  public void setFileService(FileService fileService) {
    this.fileService = fileService;
  }

  @Autowired
  public void setCollectorRepository(CollectorRepository collectorRepository) {
    this.collectorRepository = collectorRepository;
  }

  @Transactional
  public void register(String id, String type, String name, InputStream iconData) throws Exception {
    if (iconData != null) {
      fileService.uploadStream(COLLECTORS_IMAGES_BASE_PATH, type + ".png", iconData);
    }
    Collector collector = collectorRepository.findById(id).orElse(null);
    if (collector == null) {
      Collector collectorChecking = collectorRepository.findByType(type).orElse(null);
      if (collectorChecking != null) {
        throw new Exception(
            "The collector "
                + type
                + " already exists with a different ID, please delete it or contact your administrator.");
      }
    }
    if (collector != null) {
      collector.setName(name);
      collector.setExternal(false);
      collector.setType(type);
      collectorRepository.save(collector);
    } else {
      // save the collector
      Collector newCollector = new Collector();
      newCollector.setId(id);
      newCollector.setName(name);
      newCollector.setType(type);
      collectorRepository.save(newCollector);
    }
  }
}
