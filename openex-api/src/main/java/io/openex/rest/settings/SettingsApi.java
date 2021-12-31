package io.openex.rest.settings;

import io.openex.config.OpenExConfig;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.settings.response.OAuthProvider;
import io.openex.rest.settings.response.PlatformSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

@RestController
public class SettingsApi extends RestBehavior {

    @Resource
    private OAuth2ClientProperties properties;

    @Resource
    private OpenExConfig openExConfig;

    private Environment env;

    @Autowired
    public void setEnv(Environment env) {
        this.env = env;
    }

    private List<OAuthProvider> platformProviders() {
        Map<String, OAuth2ClientProperties.Provider> providers = properties.getProvider();
        return providers.keySet().stream()
                .map(s -> {
                    String providerLogin = env.getProperty("openex.provider." + s + ".login", "Login with " + s);
                    return new OAuthProvider(s, "/oauth2/authorization/" + s, providerLogin);
                })
                .toList();
    }

    @GetMapping("/api/settings")
    public PlatformSettings settings() {
        PlatformSettings settings = new PlatformSettings();
        settings.setProviders(platformProviders());
        settings.setOpenIdEnable(openExConfig.isAuthOpenidEnable());
        settings.setLocalEnable(openExConfig.isAuthLocalEnable());
        settings.setTileServer(openExConfig.getMapTileServer());
        return settings;
    }
}
