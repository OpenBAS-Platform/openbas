package io.openbas.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas")
@Data
public class OpenBASConfig {

  @JsonProperty("parameters_id")
  private String id = "global";

  @JsonProperty("application_name")
  private String name = "OpenBAS";

  @JsonProperty("application_base_url")
  private String baseUrl;

  @JsonProperty("application_version")
  private String version;

  @JsonProperty("map_tile_server_light")
  private String mapTileServerLight;

  @JsonProperty("map_tile_server_dark")
  private String mapTileServerDark;

  @JsonProperty("auth_local_enable")
  private boolean authLocalEnable;

  @JsonProperty("auth_openid_enable")
  private boolean authOpenidEnable;

  @JsonProperty("auth_saml2_enable")
  private boolean authSaml2Enable;

  @JsonProperty("auth_kerberos_enable")
  private boolean authKerberosEnable;

  @JsonProperty("default_mailer")
  private String defaultMailer;

  @JsonProperty("default_reply_to")
  private String defaultReplyTo;

  @JsonProperty("admin_token")
  @Value("${openbas.admin.token:#{null}}")
  private String adminToken;

  @JsonProperty("disabled_dev_features")
  private String disabledDevFeatures = "";

  @JsonIgnore
  private String cookieName = "openbas_token";

  @JsonIgnore
  private String cookieDuration = "P1D";

  @JsonIgnore
  private boolean cookieSecure = false;


  public String getBaseUrl() {
    return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
  }
}
