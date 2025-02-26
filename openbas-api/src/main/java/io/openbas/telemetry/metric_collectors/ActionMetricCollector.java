package io.openbas.telemetry.metric_collectors;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service
@RequiredArgsConstructor
public class ActionMetricCollector {
  private final MetricRegistry metricRegistry;

  // Counter
  private final AtomicLong scenarioCreatedCount = new AtomicLong(0);
  private final AtomicLong simulationCreatedCount = new AtomicLong(0);
  private final AtomicLong atomicTestingCreatedCount = new AtomicLong(0);
  private final AtomicLong simulationPlayedCount = new AtomicLong(0);
  private final AtomicLong injectWithPayloadPlayedCount = new AtomicLong(0);
  private final AtomicLong injectWithoutPayloadPlayedCount = new AtomicLong(0);

  @PostConstruct
  public void init() {
    metricRegistry.registerGauge(
        "scenarios_created_count ",
        "Number of scenarios created",
        () -> scenarioCreatedCount.getAndSet(0));
    metricRegistry.registerGauge(
        "simulations_created_count",
        "Number of simulations created",
        () -> simulationCreatedCount.getAndSet(0));
    metricRegistry.registerGauge(
        "atomic_testings_created_count",
        "Number of atomic testings created",
        () -> atomicTestingCreatedCount.getAndSet(0));

    metricRegistry.registerGauge(
        "simulations_played_count",
        "Number of simulations played",
        () -> simulationPlayedCount.getAndSet(0));
    metricRegistry.registerGauge(
        "inject_with_payload_played_count",
        "Number of inject with payload played",
        () -> injectWithPayloadPlayedCount.getAndSet(0));
    metricRegistry.registerGauge(
        "inject_without_payload_played_count",
        "Number of inject without payload played",
        () -> injectWithoutPayloadPlayedCount.getAndSet(0));
  }

  public void addScenarioCreatedCount() {
    scenarioCreatedCount.incrementAndGet();
    log.info("Increment Scenarios Created Counter");
  }

  public void addSimulationCreatedCount() {
    simulationCreatedCount.incrementAndGet();
    log.info("Increment Simulation Created Counter");
  }

  public void addAtomicTestingCreatedCount() {
    atomicTestingCreatedCount.incrementAndGet();
    log.info("Increment AtomicTestings Created Counter");
  }

  public void addSimulationPlayedCount() {
    simulationPlayedCount.incrementAndGet();
    log.info("Increment Simulation Played Counter");
  }

  public void addSimulationPlayedCount(long count) {
    simulationPlayedCount.addAndGet(count);
    log.info("Increment Simulation Played Counter");
  }

  private void addInjectWithPayloadPlayedCount() {
    injectWithPayloadPlayedCount.incrementAndGet();
    log.info("Increment Inject Played with payload Counter");
  }

  private void addInjectWithoutPayloadPlayedCount() {
    injectWithoutPayloadPlayedCount.incrementAndGet();
    log.info("Increment Inject Played without payload Counter");
  }

  public void addInjectPlayedCount(boolean hasPayload) {
    if (hasPayload) {
      addInjectWithPayloadPlayedCount();
    } else {
      addInjectWithoutPayloadPlayedCount();
    }
  }
}
