package io.openbas.collectors.fake_detector;

import io.openbas.collectors.fake_detector.config.CollectorFakeDetectorConfig;
import io.openbas.collectors.fake_detector.service.FakeDetectorService;
import io.openbas.integrations.CollectorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class FakeDetectorCollector {

  private final CollectorFakeDetectorConfig config;
  private final TaskScheduler taskScheduler;
  private final FakeDetectorService fakeDetectorService;
  private final CollectorService collectorService;

  @PostConstruct
  public void init() {
    if (this.config.isEnable()) {
      FakeDetectorJob job = new FakeDetectorJob(this.collectorService, this.config, this.fakeDetectorService);
      this.taskScheduler.scheduleAtFixedRate(job, Duration.ofSeconds(this.config.getInterval()));
    }
  }

}
