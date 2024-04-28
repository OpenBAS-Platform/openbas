package io.openbas.collectors.caldera.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.EndpointService;
import io.openbas.collectors.caldera.client.CalderaCollectorClient;
import io.openbas.collectors.caldera.config.CalderaCollectorConfig;
import io.openbas.collectors.caldera.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.integrations.CollectorService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.apache.hc.client5.http.ClientProtocolException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.logging.Level;

import static java.time.ZoneOffset.UTC;
import static java.util.stream.Collectors.groupingBy;

@Log
@Service
public class CalderaCollectorService implements Runnable {

  private static final String CALDERA_COLLECTOR_TYPE = "openbas_caldera";
  private static final String CALDERA_COLLECTOR_NAME = "Caldera";

  private final CalderaCollectorClient client;
  private final CalderaCollectorConfig config;

  private final EndpointService endpointService;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Autowired
  public CalderaCollectorService(CollectorService collectorService, CalderaCollectorClient client,
      CalderaCollectorConfig config, EndpointService endpointService) {
    this.client = client;
    this.config = config;
    this.endpointService = endpointService;
    try {
      collectorService.register(this.config.getId(), CALDERA_COLLECTOR_TYPE, CALDERA_COLLECTOR_NAME,
          getClass().getResourceAsStream("/img/icon-caldera.png"));
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error creating caldera collector");
    }
  }

  @Override
  public void run() {
    try {
      List<Agent> agents = this.client.agents();
      List<Endpoint> toCreate = new ArrayList<>();
      List<Endpoint> toUpdate = new ArrayList<>();

      // Grouped By Host
      Map<String, List<Endpoint>> groupedEndpointsByHostname = toEndpoint(agents).stream()
          .collect(groupingBy(Endpoint::getHostname));

      groupedEndpointsByHostname.forEach((hostname, endpointsByHostname) -> {
        // Verify if exists by hostname
        List<Endpoint> existingListByHostname = this.endpointService.findBySourceAndHostname(this.config.getId(),
            hostname);

        // If no existing -> create
        if (CollectionUtils.isEmpty(existingListByHostname)) {
          toCreate.addAll(endpointsByHostname);
        } else {
          // Grouped By Ips
          Map<List<String>, List<Endpoint>> groupedEndpointsByIps = endpointsByHostname.stream()
              .collect(groupingBy((e) -> Arrays.stream(e.getIps()).toList()));

          groupedEndpointsByIps.forEach(((ips, endpointsByIps) -> {
            // Verify if exists by IPs
            Optional<Endpoint> existingByIps = existingListByHostname.stream()
                .filter((e) -> ips.equals(Arrays.stream(e.getIps()).toList()))
                .findFirst();
            // If no identical IP -> create
            if (existingByIps.isEmpty()) {
              toCreate.addAll(endpointsByIps);
            } else {
              Endpoint lastSeenEndpoint = endpointsByIps.stream()
                  .max(Comparator.comparing(Endpoint::getLastSeen))
                  .orElse(null);
              assert lastSeenEndpoint != null;
              Endpoint existing = existingByIps.get();
              toUpdate.add(updateEndpoint(existing, lastSeenEndpoint));
            }
          }));
        }
      });
      this.endpointService.createEndpoints(toCreate);
      this.endpointService.updateEndpoints(toUpdate);
      log.info("Caldera collector provisioning based on " + (toCreate.size() + toUpdate.size()) + " assets");
    } catch (ClientProtocolException | JsonProcessingException e) {
      log.log(Level.SEVERE, "Error running caldera service");
    }
  }

  // -- PRIVATE --

  private List<Endpoint> toEndpoint(@NotNull final List<Agent> agents) {
    final String collectorId = this.config.getId();
    return agents.stream()
        .map((agent) -> {
          Endpoint endpoint = new Endpoint();
          endpoint.setSources(new HashMap<>() {{
            put(collectorId, agent.getPaw());
          }});
          endpoint.setBlobs(new HashMap<>() {{
            try {
              put(collectorId, objectMapper.writeValueAsString(agent));
            } catch (JsonProcessingException e) {
              throw new RuntimeException(e);
            }
          }});
          endpoint.setName(agent.getHost());
          endpoint.setDescription("Asset collect by Caldera");
          endpoint.setIps(agent.getHost_ip_addrs());
          endpoint.setHostname(agent.getHost());
          endpoint.setPlatform(toPlatform(agent.getPlatform()));
          endpoint.setLastSeen(toInstant(agent.getLast_seen()));
          return endpoint;
        })
        .toList();
  }

  private Endpoint updateEndpoint(@NotNull final Endpoint existing, @NotNull final Endpoint external) {
    String source = external.getSources().get(this.config.getId());
    existing.getSources().put(this.config.getId(), source);
    String blob = external.getBlobs().get(this.config.getId());
    existing.getBlobs().put(this.config.getId(), blob);
    existing.setLastSeen(external.getLastSeen());
    return existing;
  }

  private Endpoint.PLATFORM_TYPE toPlatform(@NotBlank final String platform) {
    return switch (platform) {
      case "linux" -> Endpoint.PLATFORM_TYPE.Linux;
      case "windows" -> Endpoint.PLATFORM_TYPE.Windows;
      case "darwin" -> Endpoint.PLATFORM_TYPE.MacOS;
      default -> throw new IllegalArgumentException("This platform is not supported : " + platform);
    };
  }

  private Instant toInstant(@NotNull final String lastSeen) {
    String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(pattern, Locale.getDefault());
    LocalDateTime localDateTime = LocalDateTime.parse(lastSeen, dateTimeFormatter);
    ZonedDateTime zonedDateTime = localDateTime.atZone(UTC);
    return zonedDateTime.toInstant();
  }

}
