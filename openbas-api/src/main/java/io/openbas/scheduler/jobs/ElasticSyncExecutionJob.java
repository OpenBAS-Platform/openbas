package io.openbas.scheduler.jobs;

import io.openbas.database.model.Filters;
import io.openbas.engine.EsTimeseries;
import io.openbas.engine.api.DateHistogramConfig;
import io.openbas.service.EsService;
import java.util.List;
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
    // Try to fetch for demo
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    Filters.Filter filter = new Filters.Filter();
    filter.setKey("type");
    filter.setOperator(Filters.FilterOperator.eq);
    filter.setValues(List.of("finding"));
    filterGroup.setFilters(List.of(filter));
    DateHistogramConfig config = new DateHistogramConfig(filterGroup);
    List<EsTimeseries> timeseries = esService.dateHistogram(config);
    System.out.println(timeseries);
  }
}
