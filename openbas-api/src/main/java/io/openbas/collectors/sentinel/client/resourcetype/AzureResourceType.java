package io.openbas.collectors.sentinel.client.resourcetype;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AzureResourceType {

  ALERTS ("alerts"),
  API_VERSION ("api-version"),
  ENTITIES ("entities"),
  FILTER_UPDATED_SINCE_GREATER_THAN("$filter=properties/lastModifiedTimeUtc gt "),
  INCIDENTS ("incidents");

  private final String param;
}
