package io.openbas.rest.settings;

import io.openbas.config.OpenBASConfig;
import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Setting;
import io.openbas.database.model.Theme;
import io.openbas.database.repository.SettingRepository;
import io.openbas.injects.opencti.config.OpenCTIConfig;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.settings.form.ThemeInput;
import io.openbas.rest.settings.response.OAuthProvider;
import io.openbas.rest.settings.response.PlatformSetting;
import io.openbas.rest.settings.response.PlatformSettings;
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

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.Setting.SETTING_KEYS.*;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
import static java.util.Optional.ofNullable;


@RestController
public class PlatformSettingsApi extends RestBehavior {

  private ApplicationContext context;
  private Environment env;
  private SettingRepository settingRepository;

  private OpenCTIConfig openCTIConfig;

  @Resource
  private OpenBASConfig openBASConfig;

  @Autowired
  public void setOpenCTIConfig(OpenCTIConfig openCTIConfig) {
    this.openCTIConfig = openCTIConfig;
  }

  @Autowired
  public void setSettingRepository(SettingRepository settingRepository) {
    this.settingRepository = settingRepository;
  }

  @Autowired
  public void setEnv(Environment env) {
    this.env = env;
  }

  @Autowired
  public void setContext(ApplicationContext context) {
    this.context = context;
  }

  private List<OAuthProvider> buildOpenIdProviders() {
    if (!this.openBASConfig.isAuthOpenidEnable()) {
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

  private Map<String, Setting> mapOfSettings() {
    return fromIterable(this.settingRepository.findAll()).stream().collect(
        Collectors.toMap(Setting::getKey, Function.identity()));
  }

  private List<OAuthProvider> buildSaml2Providers() {
    if (!this.openBASConfig.isAuthSaml2Enable()) {
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

  private Setting resolveFromMap(Map<String, Setting> dbSettings, String themeKey, String value) {
    Optional<Setting> optionalSetting = ofNullable(dbSettings.get(themeKey));
    if (optionalSetting.isPresent()) {
      Setting updateSetting = optionalSetting.get();
      updateSetting.setValue(value);
      return updateSetting;
    }
    return new Setting(themeKey, value);
  }

  @GetMapping("/api/platform/settings")
  public PlatformSettings settings() {
    // Get setting from database
    Map<String, Setting> dbSettings = mapOfSettings();
    PlatformSettings platformSettings = new PlatformSettings();

    // Build anonymous settings
    platformSettings.setPlatformOpenIdProviders(buildOpenIdProviders());
    platformSettings.setPlatformSaml2Providers(buildSaml2Providers());
    platformSettings.setAuthOpenidEnable(openBASConfig.isAuthOpenidEnable());
    platformSettings.setAuthSaml2Enable(openBASConfig.isAuthSaml2Enable());
    platformSettings.setAuthLocalEnable(openBASConfig.isAuthLocalEnable());
    platformSettings.setPlatformTheme(dbSettings.get(DEFAULT_THEME.key()).getValue());
    platformSettings.setPlatformLang(dbSettings.get(DEFAULT_LANG.key()).getValue());

    // Build authenticated user settings
    OpenBASPrincipal user = currentUser();
    if (user != null) {
      platformSettings.setMapTileServerLight(openBASConfig.getMapTileServerLight());
      platformSettings.setMapTileServerDark(openBASConfig.getMapTileServerDark());
      platformSettings.setPlatformName(dbSettings.get(PLATFORM_NAME.key()).getValue());
      platformSettings.setXtmOpenctiEnable(openCTIConfig.getEnable());
      platformSettings.setXtmOpenctiUrl(openCTIConfig.getUrl());

      // Build admin settings
      if (user.isAdmin()) {
        platformSettings.setPlatformVersion(openBASConfig.getVersion());
        platformSettings.setPostgreVersion(settingRepository.getServerVersion());
        platformSettings.setJavaVersion(Runtime.version().toString());
      }
    }

    // THEME
    ThemeInput themeLight = new ThemeInput();
    themeLight.setBackgroundColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.BACKGROUND_COLOR).getValue());
    themeLight.setAccentColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.PAPER_COLOR).getValue());
    themeLight.setNavigationColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.NAVIGATION_COLOR).getValue());
    themeLight.setPrimaryColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.PRIMARY_COLOR).getValue());
    themeLight.setSecondaryColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.SECONDARY_COLOR).getValue());
    themeLight.setAccentColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.ACCENT_COLOR).getValue());
    themeLight.setLogoUrl(mapOfSettings().get("ligth." + Theme.THEME_KEYS.LOGO_URL).getValue());
    themeLight.setLogoLoginUrl(mapOfSettings().get("ligth." + Theme.THEME_KEYS.LOGO_LOGIN_URL).getValue());
    themeLight.setLogoUrlCollapsed(mapOfSettings().get("ligth." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED).getValue());
    platformSettings.setThemeLight(themeLight);

    ThemeInput themeDark = new ThemeInput();
    themeDark.setBackgroundColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.BACKGROUND_COLOR).getValue());
    themeDark.setAccentColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.PAPER_COLOR).getValue());
    themeDark.setNavigationColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.NAVIGATION_COLOR).getValue());
    themeDark.setPrimaryColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.PRIMARY_COLOR).getValue());
    themeDark.setSecondaryColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.SECONDARY_COLOR).getValue());
    themeDark.setAccentColor(mapOfSettings().get("ligth." + Theme.THEME_KEYS.ACCENT_COLOR).getValue());
    themeDark.setLogoUrl(mapOfSettings().get("ligth." + Theme.THEME_KEYS.LOGO_URL).getValue());
    themeDark.setLogoLoginUrl(mapOfSettings().get("ligth." + Theme.THEME_KEYS.LOGO_LOGIN_URL).getValue());
    themeDark.setLogoUrlCollapsed(mapOfSettings().get("ligth." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED).getValue());
    platformSettings.setThemeDark(themeDark);

    return platformSettings;
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/settings/theme/light")
  public PlatformSettings updateThemeLight(@Valid @RequestBody ThemeInput input) {
    Map<String, Setting> dbSettings = mapOfSettings();
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(
        resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.BACKGROUND_COLOR, input.getBackgroundColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.PAPER_COLOR, input.getPaperColor()));
    settingsToSave.add(
        resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.NAVIGATION_COLOR, input.getNavigationColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.PRIMARY_COLOR, input.getPrimaryColor()));
    settingsToSave.add(
        resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.SECONDARY_COLOR, input.getSecondaryColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.ACCENT_COLOR, input.getAccentColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.LOGO_URL, input.getLogoUrl()));
    settingsToSave.add(
        resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED, input.getLogoUrlCollapsed()));
    settingsToSave.add(resolveFromMap(dbSettings, "ligth." + Theme.THEME_KEYS.LOGO_LOGIN_URL, input.getLogoLoginUrl()));
    settingRepository.saveAll(settingsToSave);
    return settings();
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/settings/theme/dark")
  public PlatformSettings updateThemeDark(@Valid @RequestBody ThemeInput input) {
    Map<String, Setting> dbSettings = mapOfSettings();
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(
        resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.BACKGROUND_COLOR, input.getBackgroundColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.PAPER_COLOR, input.getPaperColor()));
    settingsToSave.add(
        resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.NAVIGATION_COLOR, input.getNavigationColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.PRIMARY_COLOR, input.getPrimaryColor()));
    settingsToSave.add(
        resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.SECONDARY_COLOR, input.getSecondaryColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.ACCENT_COLOR, input.getAccentColor()));
    settingsToSave.add(resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.LOGO_URL, input.getLogoUrl()));
    settingsToSave.add(
        resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED, input.getLogoUrlCollapsed()));
    settingsToSave.add(resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.LOGO_LOGIN_URL, input.getLogoLoginUrl()));
    settingRepository.saveAll(settingsToSave);
    return settings();
  }

}
