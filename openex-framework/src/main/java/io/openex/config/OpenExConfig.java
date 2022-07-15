package io.openex.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openex")
public class OpenExConfig {

    @JsonProperty("parameters_id")
    private String id = "global";

    @JsonProperty("application_name")
    private String name = "OpenEx";

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

    @JsonProperty("auth_kerberos_enable")
    private boolean authKerberosEnable;

    @JsonIgnore
    private String cookieName = "openex_token";

    @JsonIgnore
    private String cookieDuration = "P1D";

    @JsonIgnore
    private boolean cookieSecure = false;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBaseUrl() {
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCookieName() {
        return cookieName;
    }

    public void setCookieName(String cookieName) {
        this.cookieName = cookieName;
    }

    public boolean isCookieSecure() {
        return cookieSecure;
    }

    public void setCookieSecure(boolean cookieSecure) {
        this.cookieSecure = cookieSecure;
    }

    public String getCookieDuration() {
        return cookieDuration;
    }

    public void setCookieDuration(String cookieDuration) {
        this.cookieDuration = cookieDuration;
    }

    public String getMapTileServerLight() {
        return mapTileServerLight;
    }

    public void setMapTileServerLight(String mapTileServerLight) {
        this.mapTileServerLight = mapTileServerLight;
    }

    public String getMapTileServerDark() {
        return mapTileServerDark;
    }

    public void setMapTileServerDark(String mapTileServerDark) {
        this.mapTileServerDark = mapTileServerDark;
    }

    public boolean isAuthLocalEnable() {
        return authLocalEnable;
    }

    public void setAuthLocalEnable(boolean authLocalEnable) {
        this.authLocalEnable = authLocalEnable;
    }

    public boolean isAuthOpenidEnable() {
        return authOpenidEnable;
    }

    public void setAuthOpenidEnable(boolean authOpenidEnable) {
        this.authOpenidEnable = authOpenidEnable;
    }

    public boolean isAuthKerberosEnable() {
        return authKerberosEnable;
    }

    public void setAuthKerberosEnable(boolean authKerberosEnable) {
        this.authKerberosEnable = authKerberosEnable;
    }
}
