package io.openbas.collectors.sentinel.client.resourcetype;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum LogAnalyticsResourceType {

  FILTER_UPDATED_SINCE_GREATER_THAN("&timespan=PT"),
  QUERY_SECURITY_ALERT("{\"query\": \"SecurityAlert | sort by TimeGenerated desc\"}");

  private final String param;
}
