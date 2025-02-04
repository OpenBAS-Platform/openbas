package io.openbas.service;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

import io.openbas.config.OpenBASConfig;
import io.openbas.rabbitmq.RabbitmqConfig;
import io.openbas.rest.settings.PreviewFeature;
import io.openbas.rest.settings.response.PlatformSettings;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@TestInstance(PER_CLASS)
public class PlatformServiceSettingsTest {

  @Autowired private PlatformSettingsService platformSettingsService;
  @Resource private RabbitmqConfig rabbitmqConfig;
  @Resource private OpenBASConfig openbasConfig;

  @BeforeAll
  public void beforeAll() {
    // some repetitive setup necessary to mock config
    rabbitmqConfig.setUser("admin");
    rabbitmqConfig.setPass("pass");
  }

  @Test
  @WithMockAdminUser
  public void given_config_has_null_flags_enabled_features_is_empty() {
    openbasConfig.setEnabledDevFeatures(null);

    PlatformSettings settings = platformSettingsService.findSettings();

    assertThat(settings.getEnabledDevFeatures(), is(equalTo(List.of())));
  }

  @Test
  @WithMockAdminUser
  public void given_config_has_invalid_flags_enabled_features_does_not_account_for_these_flags() {
    openbasConfig.setEnabledDevFeatures("non existing feature flag");

    PlatformSettings settings = platformSettingsService.findSettings();

    assertThat(settings.getEnabledDevFeatures(), is(empty()));
  }

  @Test
  @WithMockAdminUser
  public void given_config_has_valid_flags_enabled_features_accounts_for_these_flags() {
    openbasConfig.setEnabledDevFeatures(PreviewFeature._RESERVED.name());

    PlatformSettings settings = platformSettingsService.findSettings();

    assertThat(settings.getEnabledDevFeatures(), is(equalTo(List.of(PreviewFeature._RESERVED))));
  }

  @Test
  @WithMockAdminUser
  public void
      given_config_has_valid_flags_when_same_flag_stated_twice_enabled_features_accounts_for_flag_once() {
    openbasConfig.setEnabledDevFeatures(
        "%s, %s".formatted(PreviewFeature._RESERVED.name(), PreviewFeature._RESERVED.name()));

    PlatformSettings settings = platformSettingsService.findSettings();

    assertThat(settings.getEnabledDevFeatures(), is(equalTo(List.of(PreviewFeature._RESERVED))));
  }
}
