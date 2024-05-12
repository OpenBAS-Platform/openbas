package io.openbas.collectors.fake_detector;

import io.openbas.collectors.fake_detector.config.CollectorFakeDetectorConfig;
import io.openbas.collectors.fake_detector.service.FakeDetectorService;
import io.openbas.integrations.CollectorService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.logging.Level;

@Service
@Log
public class FakeDetectorJob implements Runnable {
  private static final String FAKE_DETECTOR_COLLECTOR_TYPE = "openbas_fake_detector";
  private static final String FAKE_DETECTOR_COLLECTOR_NAME = "OpenBAS Fake Detector";
  private final FakeDetectorService fakeDetectorService;

  @Autowired
  public FakeDetectorJob(CollectorService collectorService, CollectorFakeDetectorConfig config, FakeDetectorService fakeDetectorService) {
    this.fakeDetectorService = fakeDetectorService;
    try {
      collectorService.register(config.getId(), FAKE_DETECTOR_COLLECTOR_TYPE, FAKE_DETECTOR_COLLECTOR_NAME, getClass().getResourceAsStream("/img/icon-fake-detector.png"));
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error creating fake detector collector");
    }
  }

  @Override
  public void run() {
    // Detection & Prevention
    try {
      this.fakeDetectorService.computeExpectations();
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error running fake detector service");
    }
  }

}
