package io.openbas.collectors.expectations_expiration_manager;

import io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig;
import io.openbas.collectors.expectations_expiration_manager.service.ExpectationsExpirationManagerService;
import io.openbas.integrations.CollectorService;
import java.util.logging.Level;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Log
public class ExpectationsExpirationManagerJob implements Runnable {
  private static final String FAKE_DETECTOR_COLLECTOR_TYPE = "openbas_fake_detector";
  private static final String FAKE_DETECTOR_COLLECTOR_NAME = "Expectations Expiration Manager";
  private final ExpectationsExpirationManagerService fakeDetectorService;

  @Autowired
  public ExpectationsExpirationManagerJob(
      CollectorService collectorService,
      ExpectationsExpirationManagerConfig config,
      ExpectationsExpirationManagerService fakeDetectorService) {
    this.fakeDetectorService = fakeDetectorService;
    try {
      collectorService.register(
          config.getId(),
          FAKE_DETECTOR_COLLECTOR_TYPE,
          FAKE_DETECTOR_COLLECTOR_NAME,
          getClass().getResourceAsStream("/img/icon-fake-detector.png"));
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error creating expectations expiration manager ");
    }
  }

  @Override
  public void run() {
    // Detection & Prevention
    try {
      this.fakeDetectorService.computeExpectations();
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error running expectations expiration manager service", e);
    }
  }
}
