package io.openbas.service;

import io.openbas.config.OpenBASConfig;
import io.openbas.config.OpenBASPrincipal;
import io.openbas.config.RabbitmqConfig;
import io.openbas.database.model.BannerMessage;
import io.openbas.database.model.Setting;
import io.openbas.database.model.Theme;
import io.openbas.database.repository.SettingRepository;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.helper.RabbitMQHelper;
import io.openbas.injectors.opencti.config.OpenCTIConfig;
import io.openbas.rest.settings.form.*;
import io.openbas.rest.settings.response.OAuthProvider;
import io.openbas.rest.settings.response.PlatformSettings;
import io.openbas.rest.stream.ai.AiConfig;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.SettingKeys.*;
import static io.openbas.helper.StreamHelper.fromIterable;
import static java.util.Optional.ofNullable;

@Service
@Log
public class PlatformSettingsService {

  public static final String THEME_TYPE_LIGHT = "light";
  public static final String THEME_TYPE_DARK = "dark";

  private ApplicationContext context;
  private Environment env;
  private SettingRepository settingRepository;
  private OpenCTIConfig openCTIConfig;
  private AiConfig aiConfig;
  private CalderaExecutorConfig calderaExecutorConfig;

  @Resource
  private OpenBASConfig openBASConfig;
  @Resource
  private RabbitmqConfig rabbitmqConfig;

  @Autowired
  public void setOpenCTIConfig(OpenCTIConfig openCTIConfig) {
    this.openCTIConfig = openCTIConfig;
  }

  @Autowired
  public void setAiConfig(AiConfig aiConfig) {
    this.aiConfig = aiConfig;
  }

  @Autowired
  public void setCalderaExecutorConfig(CalderaExecutorConfig calderaExecutorConfig) {
    this.calderaExecutorConfig = calderaExecutorConfig;
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

  // -- PROVIDERS --
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
            String clientName = env.getProperty("openbas.provider." + entry.getKey() + ".login");
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
    if (!this.openBASConfig.isAuthSaml2Enable()) {
      return new ArrayList<>();
    }
    try {
      Saml2RelyingPartyProperties properties = this.context.getBean(Saml2RelyingPartyProperties.class);
      Map<String, Saml2RelyingPartyProperties.Registration> providers = properties.getRegistration();
      return providers.entrySet().stream()
          .map(entry -> {
            String uri = "/saml2/authenticate/" + entry.getKey();
            String clientName = env.getProperty("openbas.provider." + entry.getKey() + ".login");
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


  // -- MAP UTILS --
  private Map<String, Setting> mapOfSettings(@NotBlank List<Setting> settings) {
    return settings.stream().collect(Collectors.toMap(Setting::getKey, Function.identity()));
  }

  private String getValueFromMapOfSettings(@NotBlank Map<String, Setting> dbSettings, @NotBlank final String key) {
    return Optional.ofNullable(dbSettings.get(key)).map(Setting::getValue).orElse(null);
  }

  private Setting resolveFromMap(Map<String, Setting> dbSettings, String themeKey, String value) {
    Optional<Setting> optionalSetting = ofNullable(dbSettings.get(themeKey));
    return resolve(optionalSetting, themeKey, value);
  }

  private Setting resolve(Optional<Setting> optionalSetting, String themeKey, String value) {
    if (optionalSetting.isPresent()) {
      Setting updateSetting = optionalSetting.get();
      updateSetting.setValue(value);
      return updateSetting;
    }
    return new Setting(themeKey, value);
  }


  // -- FIND SETTINGS --
  public PlatformSettings findSettings() {
    Map<String, Setting> dbSettings = mapOfSettings(fromIterable(this.settingRepository.findAll()));
    PlatformSettings platformSettings = new PlatformSettings();

    // Build anonymous settings
    platformSettings.setPlatformOpenIdProviders(buildOpenIdProviders());
    platformSettings.setPlatformSaml2Providers(buildSaml2Providers());
    platformSettings.setAuthOpenidEnable(openBASConfig.isAuthOpenidEnable());
    platformSettings.setAuthSaml2Enable(openBASConfig.isAuthSaml2Enable());
    platformSettings.setAuthLocalEnable(openBASConfig.isAuthLocalEnable());
    platformSettings.setPlatformTheme(
        ofNullable(dbSettings.get(DEFAULT_THEME.key())).map(Setting::getValue).orElse(DEFAULT_THEME.defaultValue())
    );
    platformSettings.setPlatformLang(
        ofNullable(dbSettings.get(DEFAULT_LANG.key())).map(Setting::getValue).orElse(DEFAULT_LANG.defaultValue())
    );

    // Build authenticated user settings
    OpenBASPrincipal user = currentUser();
    if (user != null) {
      platformSettings.setPlatformEnterpriseEdition(
          ofNullable(dbSettings.get(PLATFORM_ENTERPRISE_EDITION.key())).map(Setting::getValue)
              .orElse(PLATFORM_ENTERPRISE_EDITION.defaultValue())
      );
      platformSettings.setPlatformWhitemark(
          ofNullable(dbSettings.get(PLATFORM_WHITEMARK.key())).map(Setting::getValue)
              .orElse(PLATFORM_WHITEMARK.defaultValue())
      );
      platformSettings.setMapTileServerLight(openBASConfig.getMapTileServerLight());
      platformSettings.setMapTileServerDark(openBASConfig.getMapTileServerDark());
      platformSettings.setPlatformName(
          ofNullable(dbSettings.get(PLATFORM_NAME.key())).map(Setting::getValue).orElse(PLATFORM_NAME.defaultValue())
      );
      platformSettings.setPlatformBaseUrl(openBASConfig.getBaseUrl());
      platformSettings.setPlatformAgentUrl(openBASConfig.getBaseUrlForAgent());
      platformSettings.setXtmOpenctiEnable(openCTIConfig.getEnable());
      platformSettings.setXtmOpenctiUrl(openCTIConfig.getUrl());
      platformSettings.setAiEnabled(aiConfig.isEnabled());
      platformSettings.setAiHasToken(!aiConfig.getToken().isBlank());
      platformSettings.setAiType(aiConfig.getType());
      platformSettings.setAiModel(aiConfig.getModel());
      platformSettings.setExecutorCalderaEnable(calderaExecutorConfig.isEnable());
      platformSettings.setExecutorCalderaPublicUrl(calderaExecutorConfig.getPublicUrl());
      platformSettings.setExecutorTaniumEnable(false);

      // Build admin settings
      if (user.isAdmin()) {
        platformSettings.setPlatformVersion(openBASConfig.getVersion());
        platformSettings.setPostgreVersion(settingRepository.getServerVersion());
        platformSettings.setJavaVersion(Runtime.version().toString());
        platformSettings.setRabbitMQVersion(RabbitMQHelper.getRabbitMQVersion(rabbitmqConfig));
      }
    }

    // THEME
    ThemeInput themeLight = createThemeInput(dbSettings, THEME_TYPE_LIGHT);
    platformSettings.setThemeLight(themeLight);

    ThemeInput themeDark = createThemeInput(dbSettings, THEME_TYPE_DARK);
    platformSettings.setThemeDark(themeDark);

    // POLICIES
    PolicyInput policies = new PolicyInput();
    policies.setLoginMessage(getValueFromMapOfSettings(dbSettings, PLATFORM_LOGIN_MESSAGE.key()));
    policies.setConsentMessage(getValueFromMapOfSettings(dbSettings, PLATFORM_CONSENT_MESSAGE.key()));
    policies.setConsentConfirmText(getValueFromMapOfSettings(dbSettings, PLATFORM_CONSENT_CONFIRM_TEXT.key()));
    platformSettings.setPolicies(policies);

    // FEATURE FLAG
    if (!openBASConfig.getDisabledDevFeatures().isEmpty()) {
      platformSettings.setDisabledDevFeatures(
          Arrays.stream(openBASConfig.getDisabledDevFeatures().split(",")).toList()
      );
    }

    // PLATFORM MESSAGE
    Map<String, List<String>> platformBannerByLevel = new HashMap<>();
    for (BannerMessage.BANNER_KEYS bannerKey : BannerMessage.BANNER_KEYS.values()) {
      String value = getValueFromMapOfSettings(dbSettings, PLATFORM_BANNER + "." + bannerKey.key());
      if(value != null) {
        if(platformBannerByLevel.get(bannerKey.level().name()) == null) {
          platformBannerByLevel.put(bannerKey.level().name(), new ArrayList<String>(Arrays.asList(bannerKey.message())));
        } else {
          platformBannerByLevel.get(bannerKey.level().name()).add(bannerKey.message());
        }
      }
    }
    platformSettings.setPlatformBannerByLevel(platformBannerByLevel);

    return platformSettings;
  }

  private ThemeInput createThemeInput(Map<String, Setting> dbSettings, String themeType) {
    ThemeInput themeInput = new ThemeInput();
    themeInput.setBackgroundColor(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.BACKGROUND_COLOR.key()));
    themeInput.setPaperColor(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.PAPER_COLOR.key()));
    themeInput.setNavigationColor(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.NAVIGATION_COLOR.key()));
    themeInput.setPrimaryColor(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.PRIMARY_COLOR.key()));
    themeInput.setSecondaryColor(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.SECONDARY_COLOR.key()));
    themeInput.setAccentColor(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.ACCENT_COLOR.key()));
    themeInput.setLogoUrl(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.LOGO_URL.key()));
    themeInput.setLogoLoginUrl(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.LOGO_LOGIN_URL.key()));
    themeInput.setLogoUrlCollapsed(getValueFromMapOfSettings(dbSettings, themeType + "." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED.key()));
    return themeInput;
  }

  // -- UPDATE SETTINGS --

  public PlatformSettings updateBasicConfigurationSettings(SettingsUpdateInput input) {
    Map<String, Setting> dbSettings = mapOfSettings(fromIterable(this.settingRepository.findAll()));
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_NAME.key(), input.getName()));
    settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_THEME.key(), input.getTheme()));
    settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_LANG.key(), input.getLang()));
    settingRepository.saveAll(settingsToSave);
    return findSettings();
  }

  public PlatformSettings updateSettingsEnterpriseEdition(SettingsEnterpriseEditionUpdateInput input) {
    Map<String, Setting> dbSettings = mapOfSettings(fromIterable(this.settingRepository.findAll()));
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_ENTERPRISE_EDITION.key(), input.getEnterpriseEdition()));
    settingRepository.saveAll(settingsToSave);
    return findSettings();
  }

  public PlatformSettings updateSettingsPlatformWhitemark(SettingsPlatformWhitemarkUpdateInput input) {
    Map<String, Setting> dbSettings = mapOfSettings(fromIterable(this.settingRepository.findAll()));
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_WHITEMARK.key(), input.getPlatformWhitemark()));
    settingRepository.saveAll(settingsToSave);
    return findSettings();
  }

  public PlatformSettings updateSettingsPolicies(PolicyInput input) {
    Map<String, Setting> dbSettings = mapOfSettings(fromIterable(this.settingRepository.findAll()));
    List<Setting> settingsToSave = new ArrayList<>();
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_LOGIN_MESSAGE.key(), input.getLoginMessage()));
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_CONSENT_MESSAGE.key(), input.getConsentMessage()));
    settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_CONSENT_CONFIRM_TEXT.key(), input.getConsentConfirmText()));
    settingRepository.saveAll(settingsToSave);
    return findSettings();
  }

  public PlatformSettings updateThemeLight(ThemeInput input) {
    return updateTheme(input, THEME_TYPE_LIGHT);
  }

  public PlatformSettings updateThemeDark(ThemeInput input) {
    return updateTheme(input, THEME_TYPE_DARK);
  }

  private PlatformSettings updateTheme(ThemeInput input, String themeType) {
    Map<String, Setting> dbSettings = mapOfSettings(fromIterable(this.settingRepository.findAll()));
    List<Setting> settingsToSave = new ArrayList<>();

    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.BACKGROUND_COLOR.key(), input.getBackgroundColor()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.PAPER_COLOR.key(), input.getPaperColor()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.NAVIGATION_COLOR.key(), input.getNavigationColor()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.PRIMARY_COLOR.key(), input.getPrimaryColor()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.SECONDARY_COLOR.key(), input.getSecondaryColor()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.ACCENT_COLOR.key(), input.getAccentColor()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.LOGO_URL.key(), input.getLogoUrl()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED.key(), input.getLogoUrlCollapsed()));
    settingsToSave.add(resolveFromMap(dbSettings, themeType + "." + Theme.THEME_KEYS.LOGO_LOGIN_URL.key(), input.getLogoLoginUrl()));

    List<Setting> update = new ArrayList<>();
    List<Setting> delete = new ArrayList<>();
    settingsToSave.forEach(setting -> {
      if (StringUtils.hasText(setting.getValue())) {
        update.add(setting);
      } else if (StringUtils.hasText(setting.getId())) {
        delete.add(setting);
      }
    });

    settingRepository.deleteAllById(delete.stream().map(Setting::getId).collect(Collectors.toList()));
    settingRepository.saveAll(update);
    return findSettings();
  }

  // -- PLATFORM MESSAGE --

  public void cleanMessage(@NotBlank final BannerMessage.BANNER_KEYS banner) {
    settingRepository.deleteByKeyIn(List.of(PLATFORM_BANNER + "." + banner.key()));
  }

  public void errorMessage(@NotBlank final BannerMessage.BANNER_KEYS banner) {
    Optional<Setting> bannerLevelOpt = this.settingRepository.findByKey(PLATFORM_BANNER + "." + banner.key());
    if(bannerLevelOpt.isEmpty()) {
      Setting bannerLevel = resolve(bannerLevelOpt, PLATFORM_BANNER + "." + banner.key(), banner.level().name());
      settingRepository.save(bannerLevel);
    }
  }

}
