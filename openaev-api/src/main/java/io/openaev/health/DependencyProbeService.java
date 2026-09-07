package io.openaev.health;

import static io.openaev.health.PlatformDependency.ENGINE;
import static io.openaev.health.PlatformDependency.OBJECT_STORAGE;
import static io.openaev.health.PlatformDependency.POSTGRESQL;
import static io.openaev.health.PlatformDependency.RABBITMQ;

import io.minio.MinioClient;
import io.openaev.database.repository.HealthCheckRepository;
import io.openaev.engine.EngineService;
import io.openaev.service.MinioService;
import io.openaev.service.RabbitmqService;
import java.time.Duration;
import java.time.Instant;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Probes the platform dependencies in the background and publishes the outcome to {@link
 * DependencyHealthStore}. This is the only component performing dependency I/O for health and
 * metrics purposes; both {@code /api/health} and the Prometheus gauges are pure readers.
 *
 * <p>Runs on the shared {@code threadPoolTaskScheduler} (20 threads), so a dependency timing out
 * does not starve the other scheduled tasks.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DependencyProbeService {

  private final DependencyHealthStore store;
  private final HealthCheckRepository healthCheckRepository;
  private final MinioService minioService;

  @Qualifier("healthCheckMinioClient")
  private final MinioClient healthCheckMinioClient;

  private final RabbitmqService rabbitmqService;
  private final EngineService engineService;

  /**
   * Connectivity of every dependency. Each probe is a single round trip on a client configured with
   * short timeouts, so the whole pass stays bounded even when a dependency is down.
   */
  @Scheduled(fixedDelayString = "${openaev.healthcheck.connectivity-probe-interval:PT10S}")
  public void probeConnectivity() {
    probe(POSTGRESQL, healthCheckRepository::healthCheck);
    probe(RABBITMQ, rabbitmqService::checkHealth);
    probe(OBJECT_STORAGE, () -> minioService.checkStorageAccessible(healthCheckMinioClient));
    probe(ENGINE, engineService::ping);
  }

  /**
   * Storage sizes. Walking the whole object storage listing costs one round trip per 1 000 objects,
   * hence a schedule an order of magnitude slower than the connectivity one.
   */
  @Scheduled(fixedDelayString = "${openaev.healthcheck.storage-probe-interval:PT4H}")
  public void probeStorageUsage() {
    store.recordStorageUsage(
        new StorageUsage(
            sizeQuietly("PostgreSQL", healthCheckRepository::databaseUsedSize),
            sizeQuietly("engine indexes", engineService::getIndexesUsedSize),
            sizeQuietly("file storage", minioService::computeUsedSize)));
  }

  private void probe(PlatformDependency dependency, DependencyProbe dependencyProbe) {
    Instant startedAt = Instant.now();
    try {
      dependencyProbe.run();
      store.record(dependency, DependencyHealth.up(startedAt, elapsedSince(startedAt)));
    } catch (Exception e) {
      log.warn("Health probe of {} failed", dependency.getLabel(), e);
      store.record(
          dependency,
          DependencyHealth.down(startedAt, elapsedSince(startedAt), describeFailure(e)));
    }
  }

  private Long sizeQuietly(String target, Supplier<Long> sizeSupplier) {
    try {
      return sizeSupplier.get();
    } catch (Exception e) {
      // Sizes are informative only: an unavailable metric is reported as absent, never as an
      // outage.
      log.warn("Unable to compute the {} used size", target, e);
      return null;
    }
  }

  private Duration elapsedSince(Instant startedAt) {
    return Duration.between(startedAt, Instant.now());
  }

  /** Keeps the exception type when the message is empty, so the 503 body is never blank. */
  private String describeFailure(Exception e) {
    String message = e.getMessage();
    return message == null || message.isBlank() ? e.getClass().getSimpleName() : message;
  }

  @FunctionalInterface
  private interface DependencyProbe {
    void run() throws Exception;
  }
}
