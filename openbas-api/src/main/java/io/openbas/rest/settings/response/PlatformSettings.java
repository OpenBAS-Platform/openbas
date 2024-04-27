package io.openbas.rest.settings.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.rest.settings.form.ThemeInput;
import lombok.*;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettings {

  @JsonProperty("platform_name")
  private String platformName;

  @JsonProperty("platform_theme")
  private String platformTheme;

  @JsonProperty("platform_lang")
  private String platformLang;

  @JsonProperty("platform_enterprise_edition")
  private String platformEnterpriseEdition;

  @JsonProperty("platform_openid_providers")
  private List<OAuthProvider> platformOpenIdProviders;

  @JsonProperty("platform_saml2_providers")
  private List<OAuthProvider> platformSaml2Providers;

  @JsonProperty("auth_openid_enable")
  private Boolean authOpenidEnable;

  @JsonProperty("auth_saml2_enable")
  private Boolean authSaml2Enable;

  @JsonProperty("auth_local_enable")
  private Boolean authLocalEnable;

  @JsonProperty("map_tile_server_light")
  private String mapTileServerLight;

  @JsonProperty("map_tile_server_dark")
  private String mapTileServerDark;

  @JsonProperty("xtm_opencti_enable")
  private Boolean xtmOpenctiEnable;

  @JsonProperty("xtm_opencti_url")
  private String xtmOpenctiUrl;

  @JsonProperty("platform_version")
  private String platformVersion;

  @JsonProperty("postgre_version")
  private String postgreVersion;

  @JsonProperty("java_version")
  private String javaVersion;

  @JsonProperty("platform_ai_enabled")
  private Boolean aiEnabled;

  @JsonProperty("platform_ai_has_token")
  private Boolean aiHasToken;

  @JsonProperty("platform_ai_type")
  private String aiType;

  @JsonProperty("platform_ai_model")
  private String aiModel;

  // THEME

  @JsonProperty("platform_light_theme")
  private ThemeInput themeLight;

  @JsonProperty("platform_dark_theme")
  private ThemeInput themeDark;


}
