package io.openex.rest.settings;

import io.openex.config.OpenExConfig;
import io.openex.config.OpenexPrincipal;
import io.openex.database.model.Setting;
import io.openex.database.model.Setting.SETTING_KEYS;
import io.openex.database.repository.SettingRepository;
import io.openex.injects.opencti.config.OpenCTIConfig;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.settings.form.SettingsUpdateInput;
import io.openex.rest.settings.response.OAuthProvider;
import io.openex.rest.settings.response.PlatformSetting;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.openex.config.SessionHelper.currentUser;
import static io.openex.database.model.Setting.SETTING_KEYS.*;
import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;
import static java.util.Optional.ofNullable;

@RestController
public class SettingsApi extends RestBehavior {

  private SettingRepository settingRepository;
  private ApplicationContext context;
  private Environment env;
  private OpenCTIConfig openCTIConfig;

  @Resource
  private OpenExConfig openExConfig;

  @Autowired
  public void setEnv(Environment env) {
    this.env = env;
  }

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  @Autowired
  public void setSettingRepository(SettingRepository settingRepository) {
    this.settingRepository = settingRepository;
  }

  @Autowired
  public void setOpenCTIConfig(OpenCTIConfig openCTIConfig) { this.openCTIConfig = openCTIConfig; }

  private List<OAuthProvider> buildOpenIdProviders() {
    if (!this.openExConfig.isAuthOpenidEnable()) {
      return new ArrayList<>();
    }
    try {
      OAuth2ClientProperties properties = this.context.getBean(OAuth2ClientProperties.class);
      Map<String, OAuth2ClientProperties.Registration> providers = properties.getRegistration();
      return providers.entrySet().stream()
          .map(entry -> {
            String uri = "/oauth2/authorization/" + entry.getKey();
            String clientName = env.getProperty("openex.provider." + entry.getKey() + ".login");
            // In case of missing name configuration, generate a generic name
            if (clientName == null) {
              clientName = "Login with " + entry.getKey();
            }
            return new OAuthProvider(entry.getKey(), uri, clientName);
          })
          .toList();
    } catch (Exception e) {
      // No provider defined in the configuration
      return new ArrayList<>();
    }
  }

  private List<OAuthProvider> buildSaml2Providers() {
    if (!this.openExConfig.isAuthSaml2Enable()) {
      return new ArrayList<>();
    }
    try {
      Saml2RelyingPartyProperties properties = this.context.getBean(Saml2RelyingPartyProperties.class);
      Map<String, Saml2RelyingPartyProperties.Registration> providers = properties.getRegistration();
      return providers.entrySet().stream()
          .map(entry -> {
            String uri = "/saml2/authenticate/" + entry.getKey();
            String clientName = env.getProperty("openex.provider." + entry.getKey() + ".login");
            // In case of missing name configuration, generate a generic name
            if (clientName == null) {
              clientName = "Login with " + entry.getKey();
            }
            return new OAuthProvider(entry.getKey(), uri, clientName);
          })
          .toList();
    } catch (Exception e) {
      // No provider defined in the configuration
      return new ArrayList<>();
    }
  }

  private PlatformSetting buildPlatformSetting(Map<String, Setting> dbSettings, SETTING_KEYS setting) {
    Optional<Setting> platformName = ofNullable(dbSettings.get(setting.key()));
    String settingValue = platformName.map(Setting::getValue).orElse(setting.defaultValue());
    return new PlatformSetting(setting.key(), settingValue);
  }

  private Map<String, Setting> mapOfSettings() {
    return fromIterable(this.settingRepository.findAll()).stream().collect(
        Collectors.toMap(Setting::getKey, Function.identity()));
  }

  private Setting resolveFromMap(Map<String, Setting> dbSettings, SETTING_KEYS setting, String value) {
    Optional<Setting> optionalSetting = ofNullable(dbSettings.get(setting.key()));
    if (optionalSetting.isPresent()) {
      Setting updateSetting = optionalSetting.get();
      updateSetting.setValue(value);
      return updateSetting;
    }
    return new Setting(setting.key(), value);
  }

  @GetMapping("/api/settings")
  public List<PlatformSetting> settings() {
    List<PlatformSetting> settings = new ArrayList<>();
    // Get setting from database
    Map<String, Setting> dbSettings = mapOfSettings();
    // Build anonymous settings
    settings.add(new PlatformSetting("platform_openid_providers", buildOpenIdProviders()));
    settings.add(new PlatformSetting("platform_saml2_providers", buildSaml2Providers()));
    settings.add(new PlatformSetting("auth_openid_enable", openExConfig.isAuthOpenidEnable()));
    settings.add(new PlatformSetting("auth_saml2_enable", openExConfig.isAuthSaml2Enable()));
    settings.add(new PlatformSetting("auth_local_enable", openExConfig.isAuthLocalEnable()));
    settings.add(buildPlatformSetting(dbSettings, DEFAULT_THEME));
    settings.add(buildPlatformSetting(dbSettings, DEFAULT_LANG));
    // Build authenticated user settings
    OpenexPrincipal user = currentUser();
    if (user != null) {
      settings.add(new PlatformSetting("map_tile_server_light", openExConfig.getMapTileServerLight()));
      settings.add(new PlatformSetting("map_tile_server_dark", openExConfig.getMapTileServerDark()));
      settings.add(buildPlatformSetting(dbSettings, PLATFORM_NAME));
      settings.add(new PlatformSetting("xtm_opencti_url", openCTIConfig.getUrl()));
      // Build admin settings
      if (user.isAdmin()) {
        settings.add(new PlatformSetting("platform_version", openExConfig.getVersion()));
        settings.add(new PlatformSetting("postgre_version", settingRepository.getServerVersion()));
        settings.add(new PlatformSetting("java_version", Runtime.version().toString()));
      }
    }
    return settings;
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/settings")
  public List<PlatformSetting> updateSettings(@Valid @RequestBody SettingsUpdateInput input) {
    Map<String, Setting> dbSettings = mapOfSettings();
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_NAME, input.getName()));
    settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_THEME, input.getTheme()));
    settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_LANG, input.getLang()));
    settingRepository.saveAll(settingsToSave);
    return settings();
  }
}
