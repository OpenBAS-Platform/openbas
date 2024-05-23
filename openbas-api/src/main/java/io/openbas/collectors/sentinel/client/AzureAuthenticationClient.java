package io.openbas.collectors.sentinel.client;

import io.openbas.collectors.sentinel.config.CollectorSentinelConfig;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "collector.sentinel", name = "enable")
public class AzureAuthenticationClient extends AuthenticationClient {

  private static final String SCOPE = "https://management.azure.com/.default";

  public AzureAuthenticationClient(CollectorSentinelConfig collectorSentinelConfig) {
    super(collectorSentinelConfig);
  }

  @Override
  public String getScope() {
    return SCOPE;
  }

}
