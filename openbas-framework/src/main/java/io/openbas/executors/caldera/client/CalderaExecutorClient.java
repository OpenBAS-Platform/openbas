package io.openbas.executors.caldera.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Injector;
import io.openbas.executors.caldera.client.model.Ability;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.model.Agent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.hc.client5.http.ClientProtocolException;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.classic.methods.HttpDelete;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPatch;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class CalderaExecutorClient {

    private static final String KEY_HEADER = "KEY";

    private final CalderaExecutorConfig config;
    private final HttpClient httpClient = HttpClients.createDefault();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // -- AGENTS --

    private final static String AGENT_URI = "/agents";

    public List<Agent> agents() throws ClientProtocolException, JsonProcessingException {
        String jsonResponse = this.get(AGENT_URI);
        return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
        });
    }

    public void deleteAgent(Endpoint endpoint) {
        try {
            this.delete(this.config.getRestApiV2Url() + AGENT_URI + "/" + endpoint.getExternalReference());
        } catch (ClientProtocolException e) {
            throw new RuntimeException(e);
        }
    }

    // -- ABILITIES --

    private final static String ABILITIES_URI = "/abilities";

    public List<Ability> abilities() {
        try {
            String jsonResponse = this.get(ABILITIES_URI);
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public Ability createSubprocessorAbility(Injector injector) {
        try {
            List<Map<String, String>> executors = new ArrayList<>();
            Map<String, String> injectorExecutorCommands = injector.getExecutorCommands();
            if (injectorExecutorCommands.containsKey(Endpoint.PLATFORM_TYPE.Windows.name())) {
                Map<String, String> executorWindows = new HashMap<>();
                executorWindows.put("platform", "windows");
                executorWindows.put("name", "psh");
                executorWindows.put("command", injectorExecutorCommands.get(Endpoint.PLATFORM_TYPE.Windows.name()));
                executors.add(executorWindows);
            }
            if (injectorExecutorCommands.containsKey(Endpoint.PLATFORM_TYPE.Linux.name())) {
                Map<String, String> executorLinux = new HashMap<>();
                executorLinux.put("platform", "linux");
                executorLinux.put("name", "sh");
                executorLinux.put("command", injectorExecutorCommands.get(Endpoint.PLATFORM_TYPE.Linux.name()));
                executors.add(executorLinux);
            }
            if (injectorExecutorCommands.containsKey(Endpoint.PLATFORM_TYPE.MacOS.name())) {
                Map<String, String> executorMac = new HashMap<>();
                executorMac.put("platform", "darwin");
                executorMac.put("name", "sh");
                executorMac.put("command", injectorExecutorCommands.get(Endpoint.PLATFORM_TYPE.MacOS.name()));
                executors.add(executorMac);
            }
            Map<String, Object> body = new HashMap<>();
            body.put("name", "caldera-subprocessor-" + injector.getName());
            body.put("tactic", "initial-access");
            body.put("technique_id", "T1133");
            body.put("technique_name", "External Remote Services");
            body.put("executors", executors);
            String jsonResponse = this.post(
                    this.config.getRestApiV2Url() + ABILITIES_URI,
                    body
            );
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public Ability createClearAbility(Injector injector) {
        try {
            List<Map<String, String>> executors = new ArrayList<>();
            Map<String, String> injectorExecutorClearCommands = injector.getExecutorClearCommands();
            if (injectorExecutorClearCommands.containsKey(Endpoint.PLATFORM_TYPE.Windows.name())) {
                Map<String, String> executorWindows = new HashMap<>();
                executorWindows.put("platform", "windows");
                executorWindows.put("name", "psh");
                executorWindows.put("command", injectorExecutorClearCommands.get(Endpoint.PLATFORM_TYPE.Windows.name()));
                executors.add(executorWindows);
            }
            if (injectorExecutorClearCommands.containsKey(Endpoint.PLATFORM_TYPE.Linux.name())) {
                Map<String, String> executorLinux = new HashMap<>();
                executorLinux.put("platform", "linux");
                executorLinux.put("name", "sh");
                executorLinux.put("command", injectorExecutorClearCommands.get(Endpoint.PLATFORM_TYPE.Linux.name()));
                executors.add(executorLinux);
            }
            if (injectorExecutorClearCommands.containsKey(Endpoint.PLATFORM_TYPE.MacOS.name())) {
                Map<String, String> executorMac = new HashMap<>();
                executorMac.put("platform", "darwin");
                executorMac.put("name", "sh");
                executorMac.put("command", injectorExecutorClearCommands.get(Endpoint.PLATFORM_TYPE.MacOS.name()));
                executors.add(executorMac);
            }
            Map<String, Object> body = new HashMap<>();
            body.put("name", "caldera-clear-" + injector.getName());
            body.put("tactic", "initial-access");
            body.put("technique_id", "T1133");
            body.put("technique_name", "External Remote Services");
            body.put("executors", executors);
            String jsonResponse = this.post(
                    this.config.getRestApiV2Url() + ABILITIES_URI,
                    body
            );
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteAbility(Ability ability) {
        try {
            this.delete(this.config.getRestApiV2Url() + ABILITIES_URI + "/" + ability.getAbility_id());
        } catch (ClientProtocolException e) {
            throw new RuntimeException(e);
        }
    }

    // -- EXPLOITS --

    private final static String EXPLOIT_URI = "/exploit";

    public void exploit(
            @NotBlank final String obfuscator,
            @NotBlank final String paw,
            @NotBlank final String abilityId) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("obfuscator", obfuscator);
            body.put("paw", paw);
            body.put("ability_id", abilityId);
            String result = this.post(
                    this.config.getPluginAccessApiUrl() + EXPLOIT_URI,
                    body
            );
            assert result.contains("complete"); // the exploit is well taken into account
        } catch (ClientProtocolException e) {
            throw new RuntimeException(e);
        }
    }

    // -- PRIVATE --

    private String get(@NotBlank final String uri) throws ClientProtocolException {
        try {
            HttpGet httpGet = new HttpGet(this.config.getRestApiV2Url() + uri);
            // Headers
            httpGet.addHeader(KEY_HEADER, this.config.getApiKey());

            return this.httpClient.execute(
                    httpGet,
                    response -> EntityUtils.toString(response.getEntity())
            );
        } catch (IOException e) {
            throw new ClientProtocolException("Unexpected response for request on: " + uri);
        }
    }


    private String post(
            @NotBlank final String url,
            @NotNull final Map<String, Object> body) throws ClientProtocolException {
        try {
            HttpPost httpPost = new HttpPost(url);
            // Headers
            httpPost.addHeader(KEY_HEADER, this.config.getApiKey());
            // Body
            StringEntity entity = new StringEntity(this.objectMapper.writeValueAsString(body));
            httpPost.setEntity(entity);

            return this.httpClient.execute(
                    httpPost,
                    response -> EntityUtils.toString(response.getEntity())
            );
        } catch (IOException e) {
            throw new ClientProtocolException("Unexpected response for request on: " + url);
        }
    }

    private void patch(
            @NotBlank final String url,
            @NotNull final Map<String, Object> body) throws ClientProtocolException {
        try {
            HttpPatch httpPatch = new HttpPatch(url);
            // Headers
            httpPatch.addHeader(KEY_HEADER, this.config.getApiKey());
            // Body
            StringEntity entity = new StringEntity(this.objectMapper.writeValueAsString(body));
            httpPatch.setEntity(entity);
            this.httpClient.execute(httpPatch);
        } catch (IOException e) {
            throw new ClientProtocolException("Unexpected response for request on: " + url);
        }
    }

    private void delete(@NotBlank final String url) throws ClientProtocolException {
        try {
            HttpDelete httpdelete = new HttpDelete(url);
            // Headers
            httpdelete.addHeader(KEY_HEADER, this.config.getApiKey());
            this.httpClient.execute(httpdelete);
        } catch (IOException e) {
            throw new ClientProtocolException("Unexpected response for request on: " + url);
        }
    }

}
