package io.openbas.scheduler.jobs;

import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import io.openbas.engine.model.EsBase;
import io.openbas.service.EsService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ElasticSyncExecutionJob implements Job {

  private final EsService esService;
  private final EsEngine esEngine;

  @Override
  @Transactional(rollbackFor = Exception.class)
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    List<EsModel<EsBase>> models = esEngine.getModels();
    log.info("Executing bulk parallel processing for {} models", models.size());
    esService.bulkProcessing(models.stream().parallel());
  }
}
