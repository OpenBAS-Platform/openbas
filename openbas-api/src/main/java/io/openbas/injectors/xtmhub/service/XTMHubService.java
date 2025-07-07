package io.openbas.injectors.xtmhub.service;

import io.openbas.injectors.xtmhub.config.XTMHubConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class XTMHubService {

  private final XTMHubConfig config;

  public boolean isEnabled() {
    return config.getEnable() != null && config.getEnable();
  }

  public String getUrl() {
    return config.getUrl();
  }

  // Future: Add methods for XTM Hub API integration
  // public void syncData() { ... }
  // public void sendNotification() { ... }
}
