package io.openbas.integrations;

import static io.openbas.service.FileService.EXECUTORS_IMAGES_BASE_PATH;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Executor;
import io.openbas.database.repository.ExecutorRepository;
import io.openbas.service.FileService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExecutorService {

  @Resource protected ObjectMapper mapper;

  private FileService fileService;

  private ExecutorRepository executorRepository;

  @Resource
  public void setFileService(FileService fileService) {
    this.fileService = fileService;
  }

  @Autowired
  public void setExecutorRepository(ExecutorRepository executorRepository) {
    this.executorRepository = executorRepository;
  }

  @Transactional
  public Executor register(
      String id, String type, String name, InputStream iconData, String[] platforms)
      throws Exception {
    if (iconData != null) {
      fileService.uploadStream(EXECUTORS_IMAGES_BASE_PATH, type + ".png", iconData);
    }
    Executor executor = executorRepository.findById(id).orElse(null);
    if (executor == null) {
      Executor executorChecking = executorRepository.findByType(type).orElse(null);
      if (executorChecking != null) {
        throw new Exception(
            "The executor "
                + type
                + " already exists with a different ID, please delete it or contact your administrator.");
      }
    }
    if (executor != null) {
      executor.setName(name);
      executor.setType(type);
      executor.setPlatforms(platforms);
      executorRepository.save(executor);
    } else {
      // save the executor
      Executor newExecutor = new Executor();
      newExecutor.setId(id);
      newExecutor.setName(name);
      newExecutor.setType(type);
      newExecutor.setPlatforms(platforms);
      executorRepository.save(newExecutor);
    }
    return executor;
  }

  @Transactional
  public void remove(String id) {
    executorRepository.findById(id).ifPresent(executor -> executorRepository.deleteById(id));
  }

  @Transactional
  public void removeFromType(String type) {
    executorRepository
        .findByType(type)
        .ifPresent(executor -> executorRepository.deleteById(executor.getId()));
  }
}
