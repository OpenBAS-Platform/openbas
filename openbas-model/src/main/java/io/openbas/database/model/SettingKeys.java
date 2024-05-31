package io.openbas.database.model;

public enum SettingKeys {

  DEFAULT_THEME(Module.THEME,"platform_theme", "dark"),
  DEFAULT_LANG(Module.LANG, "platform_lang", "auto"),
  PLATFORM_LOGIN_MESSAGE(Module.POLICY, "platform_login_message", "This platform is dedicated to Filigran team testing. **Sandbox running the latest rolling release.**"),
  PLATFORM_CONSENT_MESSAGE(Module.POLICY,"platform_consent_message", ""),
  PLATFORM_CONSENT_CONFIRM_TEXT(Module.POLICY, "platform_consent_confirm_text", ""),
  PLATFORM_NAME(Module.CONFIGURATION, "platform_name", "OpenBAS - Breach and Attack Simulation Platform"),
  PLATFORM_ENTERPRISE_EDITION(Module.CONFIGURATION, "platform_enterprise_edition", "false"),
  PLATFORM_WHITEMARK(Module.CONFIGURATION, "platform_whitemark", "false");

  private final String key;
  private final Module type;
  private final String defaultValue;

  SettingKeys(Module type, String key, String defaultValue) {
    this.type = type;
    this.key = key;
    this.defaultValue = defaultValue;
  }

  public String key() {
    return key;
  }

  public Module type() {
    return type;
  }

  public String defaultValue() {
    return defaultValue;
  }

  public enum Module {
    CONFIGURATION,
    LANG,
    POLICY,
    THEME
  }
}