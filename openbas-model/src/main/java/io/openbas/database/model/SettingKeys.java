package io.openbas.database.model;

public enum SettingKeys {

  DEFAULT_THEME(SectionEnum.CONFIGURATION,"platform_theme", "dark"),
  DEFAULT_LANG(SectionEnum.CONFIGURATION, "platform_lang", "auto"),
  PLATFORM_CONSENT_MESSAGE(SectionEnum.POLICY,"platform_consent_message", ""),
  PLATFORM_CONSENT_CONFIRM_TEXT(SectionEnum.POLICY, "platform_consent_confirm_text", ""),
  PLATFORM_ENTERPRISE_EDITION(SectionEnum.CONFIGURATION, "platform_enterprise_edition", "false"),
  PLATFORM_LOGIN_MESSAGE(SectionEnum.POLICY, "platform_login_message", "This platform is dedicated to Filigran team testing. **Sandbox running the latest rolling release.**"),
  PLATFORM_WHITEMARK(SectionEnum.CONFIGURATION, "platform_whitemark", "false"),
  PLATFORM_NAME(SectionEnum.CONFIGURATION, "platform_name", "OpenBAS - Breach and Attack Simulation Platform");

  private final SectionEnum section;
  private final String key;
  private final String defaultValue;

  SettingKeys(SectionEnum section, String key, String defaultValue) {
    this.section = section;
    this.key = key;
    this.defaultValue = defaultValue;
  }

  public String key() {
    return key;
  }

  public SectionEnum section() {
    return section;
  }

  public String defaultValue() {
    return defaultValue;
  }

  public enum SectionEnum {
    CONFIGURATION,
    POLICY,
  }
}