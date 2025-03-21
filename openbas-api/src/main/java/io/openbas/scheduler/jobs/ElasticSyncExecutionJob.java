package io.openbas.scheduler.jobs;

import io.openbas.service.EsService;
import lombok.RequiredArgsConstructor;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ElasticSyncExecutionJob implements Job {

  private EsService esService;

  @Autowired
  public void setEsService(EsService esService) {
    this.esService = esService;
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    esService.bulkParallelProcessing();
  }
}
