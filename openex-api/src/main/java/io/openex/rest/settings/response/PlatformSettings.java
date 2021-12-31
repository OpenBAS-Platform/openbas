package io.openex.rest.settings.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class PlatformSettings {

    @JsonProperty("platform_id")
    private String id = "openex";

    @JsonProperty("auth_openid_enable")
    private boolean openIdEnable;

    @JsonProperty("auth_local_enable")
    private boolean localEnable;

    @JsonProperty("map_tile_server")
    private String tileServer;

    @JsonProperty("platform_providers")
    private List<OAuthProvider> providers;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean isOpenIdEnable() {
        return openIdEnable;
    }

    public void setOpenIdEnable(boolean openIdEnable) {
        this.openIdEnable = openIdEnable;
    }

    public boolean isLocalEnable() {
        return localEnable;
    }

    public void setLocalEnable(boolean localEnable) {
        this.localEnable = localEnable;
    }

    public String getTileServer() {
        return tileServer;
    }

    public void setTileServer(String tileServer) {
        this.tileServer = tileServer;
    }

    public List<OAuthProvider> getProviders() {
        return providers;
    }

    public void setProviders(List<OAuthProvider> providers) {
        this.providers = providers;
    }
}
