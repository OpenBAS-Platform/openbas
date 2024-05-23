package io.openbas.collectors.sentinel.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("collector.sentinel")
@Getter
@Setter
public class CollectorSentinelConfig {

  public static final String PRODUCT_NAME = "Microsoft Sentinel";

  private boolean enable;
  private String id;
  private int interval = 60;
  private int expirationTime = 1800;

  public int getExpirationTimeInMinute() {
    return this.expirationTime / 60;
  }

  private Authority authority;
  private String clientId;
  private String clientSecret;

  private Subscription subscription;

  @Getter
  @Setter
  public static class Authority {

    private String baseUrl;
    private String tenantId;

    public String getUrl() {
      return this.baseUrl + "/" + this.tenantId;
    }
  }

  @Getter
  @Setter
  public static class Subscription {

    private String id;
    private ResourceGroups resourceGroups;
    private Workspace workspace;

    private String getUri() {
      return "/subscriptions/" + this.id;
    }

    public String getBaseUri() {
      return this.getUri() + this.resourceGroups.getUri() + this.workspace.getUri();
    }
  }

  @Getter
  @Setter
  public static class ResourceGroups {

    private String name;

    private String getUri() {
      return "/resourcegroups/" + this.name;
    }
  }

  @Getter
  @Setter
  public static class Workspace {

    private String name;

    private String getUri() {
      return "/providers/microsoft.operationalinsights/workspaces/" + this.name;
    }
  }
}

