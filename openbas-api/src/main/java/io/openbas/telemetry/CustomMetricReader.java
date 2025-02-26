package io.openbas.telemetry;

import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.data.*;
import io.opentelemetry.sdk.metrics.export.CollectionRegistration;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import io.opentelemetry.sdk.metrics.internal.data.ImmutableGaugeData;
import io.opentelemetry.sdk.metrics.internal.data.ImmutableMetricData;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;

@Log
public class CustomMetricReader implements MetricReader {
  private final OtlpHttpMetricExporter otlpExporter;
  private final Duration collectInterval;
  private final Duration exportInterval;
  private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
  Map<String, MetricData> groupedMetrics = new HashMap<>();

  private final AtomicReference<CollectionRegistration> collectionRef =
      new AtomicReference<>(CollectionRegistration.noop());

  public CustomMetricReader(
      @NotNull OtlpHttpMetricExporter otlpExporter,
      @NotNull Duration collectIntervalInput,
      @NotNull Duration exportIntervalInput) {
    this.otlpExporter = otlpExporter;
    this.collectInterval = collectIntervalInput;
    this.exportInterval = exportIntervalInput;
  }

  @Override
  public void register(@NotNull CollectionRegistration collectionRegistration) {
    collectionRef.set(collectionRegistration);
    scheduler.scheduleAtFixedRate(
        this::collectMetrics, 0, this.collectInterval.toSeconds(), TimeUnit.SECONDS);
    scheduler.scheduleAtFixedRate(
        this::exportData, 0, this.exportInterval.toSeconds(), TimeUnit.SECONDS);
  }

  private void collectMetrics() {
    try {
      if (collectionRef.get() != null
          && !Objects.equals(collectionRef.get(), CollectionRegistration.noop())) {
        // Get all metrics
        collectionRef.get().collectAllMetrics().stream()
            .toList()
            .forEach(
                metric -> {
                  String metricName = metric.getName();
                  if (groupedMetrics.containsKey(metricName)) {
                    MetricData existingMetric = groupedMetrics.get(metricName);

                    Collection<DoublePointData> newPoints =
                        new ArrayList<>(existingMetric.getDoubleGaugeData().getPoints());
                    newPoints.addAll(metric.getDoubleGaugeData().getPoints());

                    // Create a new GaugeData object with the updated points
                    GaugeData<DoublePointData> newGaugeData = ImmutableGaugeData.create(newPoints);

                    // Replace the data in existingMetric
                    existingMetric =
                        ImmutableMetricData.createDoubleGauge(
                            existingMetric.getResource(),
                            existingMetric.getInstrumentationScopeInfo(),
                            existingMetric.getName(),
                            existingMetric.getDescription(),
                            existingMetric.getUnit(),
                            newGaugeData);

                    groupedMetrics.put(metricName, existingMetric);
                  } else {
                    groupedMetrics.put(metricName, metric);
                  }
                });
      } else {
        log.severe("CollectionRegistration not initialized");
      }
    } catch (Exception e) {
      log.severe("Error during metric collection: " + e);
    }
  }

  private void exportData() {
    if (!groupedMetrics.isEmpty()) {
      // Export the collected data to OTLP exporter
      otlpExporter.export(new ArrayList<>(groupedMetrics.values()));
      groupedMetrics.clear();
    }
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Export any records which have been queued up but not yet exported.
    log.info("flushing");
    exportData();
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    log.info("shutting down");
    scheduler.shutdownNow();
    groupedMetrics.clear();
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(@NotNull InstrumentType instrumentType) {
    return AggregationTemporality.DELTA;
  }
}
