package io.openbas.config;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "engine")
@Data
public class EngineConfig {

  private String engineSelector = "elk";

  private String indexPrefix = "openbas";

  private String indexSuffix = "-000001";

  private String numberOfShards = "1";

  private String numberOfReplicas = "1";

  private int maxResultWindow = 100000;

  private int defaultPagination = 500;

  private long maxPrimaryShardDocs = 75000000;

  private String maxPrimaryShardsSize = "50Gb";

  private String maxFieldsSize = "4096";

  @NotNull private String url;

  private String username;

  private String password;

  private boolean rejectUnauthorized = false;
}
