package io.openbas.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
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

  @JsonProperty("rabbitmq_prefix")
  private String rabbitmqPrefix;

  @JsonProperty("rabbitmq_hostname")
  private String rabbitmqHostname;

  @JsonProperty("rabbitmq_vhost")
  private String rabbitmqVhost = "/";

  @JsonProperty("rabbitmq_ssl")
  private boolean rabbitmqSsl = false;

  @JsonProperty("rabbitmq_ssl")
  private int rabbitmqPort = 5672;

  @JsonProperty("rabbitmq_user")
  private String rabbitmqUser = "guest";

  @JsonProperty("rabbitmq_pass")
  private String rabbitmqPass = "guest";

  @JsonProperty("default_reply_to")
  private String defaultReplyTo;

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
