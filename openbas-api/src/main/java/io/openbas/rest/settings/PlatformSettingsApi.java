package io.openbas.rest.settings;

import io.openbas.config.OpenBASConfig;
import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Setting;
import io.openbas.database.model.Theme;
import io.openbas.database.repository.SettingRepository;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.opencti.config.OpenCTIConfig;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.settings.form.SettingsEnterpriseEditionUpdateInput;
import io.openbas.rest.settings.form.SettingsPlatformWhitemarkUpdateInput;
import io.openbas.rest.settings.form.SettingsUpdateInput;
import io.openbas.rest.settings.form.ThemeInput;
import io.openbas.rest.settings.response.OAuthProvider;
import io.openbas.rest.settings.response.PlatformSettings;
import io.openbas.rest.stream.ai.AiConfig;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
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

    private AiConfig aiConfig;

    private CalderaInjectorConfig calderaInjectorConfig;

    @Resource
    private OpenBASConfig openBASConfig;

    @Autowired
    public void setOpenCTIConfig(OpenCTIConfig openCTIConfig) {
        this.openCTIConfig = openCTIConfig;
    }

    @Autowired
    public void setAiConfig(AiConfig aiConfig) {
        this.aiConfig = aiConfig;
    }

    @Autowired
    public void setCalderaInjectorConfig(CalderaInjectorConfig calderaInjectorConfig) {
        this.calderaInjectorConfig = calderaInjectorConfig;
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

    private String getValueFromMapOfSettings(@NotBlank final String key) {
        return Optional.ofNullable(mapOfSettings().get(key)).map(Setting::getValue).orElse(null);
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

    @GetMapping("/api/settings")
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
                    ofNullable(dbSettings.get(PLATFORM_ENTERPRISE_EDITION.key())).map(Setting::getValue).orElse(PLATFORM_ENTERPRISE_EDITION.defaultValue())
            );
            platformSettings.setPlatformWhitemark(
                ofNullable(dbSettings.get(PLATFORM_WHITEMARK.key())).map(Setting::getValue).orElse(PLATFORM_WHITEMARK.defaultValue())
            );
            platformSettings.setMapTileServerLight(openBASConfig.getMapTileServerLight());
            platformSettings.setMapTileServerDark(openBASConfig.getMapTileServerDark());
            platformSettings.setPlatformName(
                    ofNullable(dbSettings.get(PLATFORM_NAME.key())).map(Setting::getValue).orElse(PLATFORM_NAME.defaultValue())
            );
            platformSettings.setXtmOpenctiEnable(openCTIConfig.getEnable());
            platformSettings.setXtmOpenctiUrl(openCTIConfig.getUrl());
            platformSettings.setAiEnabled(aiConfig.isEnabled());
            platformSettings.setAiHasToken(!aiConfig.getToken().isBlank());
            platformSettings.setAiType(aiConfig.getType());
            platformSettings.setAiModel(aiConfig.getModel());
            platformSettings.setCalderaUrl(calderaInjectorConfig.getUrl());

            // Build admin settings
            if (user.isAdmin()) {
                platformSettings.setPlatformVersion(openBASConfig.getVersion());
                platformSettings.setPostgreVersion(settingRepository.getServerVersion());
                platformSettings.setJavaVersion(Runtime.version().toString());
            }
        }

        // THEME
        ThemeInput themeLight = new ThemeInput();
        themeLight.setBackgroundColor(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.BACKGROUND_COLOR.key()));
        themeLight.setPaperColor(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.PAPER_COLOR.key()));
        themeLight.setNavigationColor(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.NAVIGATION_COLOR.key()));
        themeLight.setPrimaryColor(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.PRIMARY_COLOR.key()));
        themeLight.setSecondaryColor(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.SECONDARY_COLOR.key()));
        themeLight.setAccentColor(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.ACCENT_COLOR.key()));
        themeLight.setLogoUrl(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.LOGO_URL.key()));
        themeLight.setLogoLoginUrl(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.LOGO_LOGIN_URL.key()));
        themeLight.setLogoUrlCollapsed(getValueFromMapOfSettings("light." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED.key()));
        platformSettings.setThemeLight(themeLight);

        ThemeInput themeDark = new ThemeInput();
        themeDark.setBackgroundColor(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.BACKGROUND_COLOR.key()));
        themeDark.setPaperColor(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.PAPER_COLOR.key()));
        themeDark.setNavigationColor(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.NAVIGATION_COLOR.key()));
        themeDark.setPrimaryColor(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.PRIMARY_COLOR.key()));
        themeDark.setSecondaryColor(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.SECONDARY_COLOR.key()));
        themeDark.setAccentColor(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.ACCENT_COLOR.key()));
        themeDark.setLogoUrl(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.LOGO_URL.key()));
        themeDark.setLogoLoginUrl(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.LOGO_LOGIN_URL.key()));
        themeDark.setLogoUrlCollapsed(getValueFromMapOfSettings("dark." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED.key()));
        platformSettings.setThemeDark(themeDark);

        return platformSettings;
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/settings")
    public PlatformSettings updateSettings(@Valid @RequestBody SettingsUpdateInput input) {
        Map<String, Setting> dbSettings = mapOfSettings();
        List<Setting> settingsToSave = new ArrayList<>();
        settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_NAME.key(), input.getName()));
        settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_THEME.key(), input.getTheme()));
        settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_LANG.key(), input.getLang()));
        settingRepository.saveAll(settingsToSave);
        return settings();
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/settings/enterprise_edition")
    public PlatformSettings updateSettingsEnterpriseEdition(@Valid @RequestBody SettingsEnterpriseEditionUpdateInput input) {
        Map<String, Setting> dbSettings = mapOfSettings();
        List<Setting> settingsToSave = new ArrayList<>();
        settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_ENTERPRISE_EDITION.key(), input.getEnterpriseEdition()));
        settingRepository.saveAll(settingsToSave);
        return settings();
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/settings/platform_whitemark")
    public PlatformSettings updateSettingsPlatformWhitemark(@Valid @RequestBody SettingsPlatformWhitemarkUpdateInput input) {
        Map<String, Setting> dbSettings = mapOfSettings();
        List<Setting> settingsToSave = new ArrayList<>();
        settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_WHITEMARK.key(), input.getPlatformWhitemark()));
        settingRepository.saveAll(settingsToSave);
        return settings();
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/settings/theme/light")
    public PlatformSettings updateThemeLight(@Valid @RequestBody ThemeInput input) {
        Map<String, Setting> dbSettings = mapOfSettings();
        List<Setting> settingsToSave = new ArrayList<>();
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.BACKGROUND_COLOR.key(), input.getBackgroundColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.PAPER_COLOR.key(), input.getPaperColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.NAVIGATION_COLOR.key(), input.getNavigationColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.PRIMARY_COLOR.key(), input.getPrimaryColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.SECONDARY_COLOR.key(), input.getSecondaryColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.ACCENT_COLOR.key(), input.getAccentColor()));
        settingsToSave.add(resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.LOGO_URL.key(), input.getLogoUrl()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED.key(), input.getLogoUrlCollapsed()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "light." + Theme.THEME_KEYS.LOGO_LOGIN_URL.key(), input.getLogoLoginUrl()));

        List<Setting> update = new ArrayList<>();
        List<Setting> delete = new ArrayList<>();
        settingsToSave.forEach(setting -> {
            if (StringUtils.hasText(setting.getValue())) {
                update.add(setting);
            } else if (StringUtils.hasText(setting.getId())) {
                delete.add(setting);
            }
        });

        settingRepository.deleteAllById(delete.stream().map(Setting::getId).toList());
        settingRepository.saveAll(update);
        return settings();
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/settings/theme/dark")
    public PlatformSettings updateThemeDark(@Valid @RequestBody ThemeInput input) {
        Map<String, Setting> dbSettings = mapOfSettings();
        List<Setting> settingsToSave = new ArrayList<>();
        settingsToSave.add(
                resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.BACKGROUND_COLOR.key(), input.getBackgroundColor()));
        settingsToSave.add(resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.PAPER_COLOR.key(), input.getPaperColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.NAVIGATION_COLOR.key(), input.getNavigationColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.PRIMARY_COLOR.key(), input.getPrimaryColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.SECONDARY_COLOR.key(), input.getSecondaryColor()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.ACCENT_COLOR.key(), input.getAccentColor()));
        settingsToSave.add(resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.LOGO_URL.key(), input.getLogoUrl()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.LOGO_URL_COLLAPSED.key(), input.getLogoUrlCollapsed()));
        settingsToSave.add(
                resolveFromMap(dbSettings, "dark." + Theme.THEME_KEYS.LOGO_LOGIN_URL.key(), input.getLogoLoginUrl()));

        List<Setting> update = new ArrayList<>();
        List<Setting> delete = new ArrayList<>();
        settingsToSave.forEach(setting -> {
            if (StringUtils.hasText(setting.getValue())) {
                update.add(setting);
            } else if (StringUtils.hasText(setting.getId())) {
                delete.add(setting);
            }
        });

        settingRepository.deleteAllById(delete.stream().map(Setting::getId).toList());
        settingRepository.saveAll(update);
        return settings();
    }

}
