package io.openbas.injectors.caldera.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Endpoint;
import io.openbas.injectors.caldera.client.model.Ability;
import io.openbas.injectors.caldera.client.model.Agent;
import io.openbas.injectors.caldera.client.model.Result;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.model.Obfuscator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.hc.client5.http.ClientProtocolException;
import org.apache.hc.client5.http.classic.methods.HttpDelete;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPatch;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class CalderaInjectorClient {

    private static final String KEY_HEADER = "KEY";

    private final CalderaInjectorConfig config;
    private final CloseableHttpClient httpClient = HttpClientBuilder.create().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // -- ABILITIES --

    private final static String ABILITIES_URI = "/abilities";

    public List<Ability> abilities() {
        try {
            String jsonResponse = this.get(this.config.getRestApiV2Url() + ABILITIES_URI);
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    // -- AGENTS --

    private final static String AGENT_URI = "/agents";

    public List<Agent> agents() {
        try {
            String jsonResponse = this.get(this.config.getRestApiV2Url() + AGENT_URI);
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public Agent agent(@NotBlank final String paw, final String include) {
        try {
            String url = this.config.getRestApiV2Url() + AGENT_URI + "/" + paw;
            if (StringUtils.hasText(include)) {
                url = url + "?include=" + include;
            }
            String jsonResponse = this.get(url);
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public void killAgent(Endpoint endpoint) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("watchdog", 1);
            body.put("sleep_min", 3);
            body.put("sleep_max", 3);
            this.patch(this.config.getRestApiV2Url() + AGENT_URI + "/" + endpoint.getExternalReference(), body);
        } catch (ClientProtocolException e) {
            throw new RuntimeException(e);
        }
    }

    public void killAgent(Agent agent) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("watchdog", 1);
            body.put("sleep_min", 3);
            body.put("sleep_max", 3);
            this.patch(this.config.getRestApiV2Url() + AGENT_URI + "/" + agent.getPaw(), body);
        } catch (ClientProtocolException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteAgent(Endpoint endpoint) {
        try {
            this.delete(this.config.getRestApiV2Url() + AGENT_URI + "/" + endpoint.getExternalReference());
        } catch (ClientProtocolException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteAgent(Agent agent) {
        try {
            this.delete(this.config.getRestApiV2Url() + AGENT_URI + "/" + agent.getPaw());
        } catch (ClientProtocolException e) {
            throw new RuntimeException(e);
        }
    }

    // -- OBFUSCATORS --

    private final static String OBFUSCATOR_URI = "/obfuscators";

    public List<Obfuscator> obfuscators() {
        try {
            String jsonResponse = this.get(this.config.getRestApiV2Url() + OBFUSCATOR_URI);
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    // -- RESULTS --

    private final static String RESULT_INDEX = "result";

    public Result results(@NotBlank final String linkId) {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("index", RESULT_INDEX);
            body.put("link_id", linkId);
            String jsonResponse = this.post(this.config.getRestApiV1Url(), body);
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (ClientProtocolException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    // -- PLUGIN ACCESS --

    private final static String EXPLOIT_URI = "/exploit";

    public void exploit(
            @NotBlank final String obfuscator,
            @NotBlank final String paw,
            @NotBlank final String abilityId) {
        try {
            Map<String, String> body = new HashMap<>();
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

    private String get(@NotBlank final String url) throws ClientProtocolException {
        try {
            HttpGet httpGet = new HttpGet(url);
            // Headers
            httpGet.addHeader(KEY_HEADER, this.config.getApiKey());

            return this.httpClient.execute(
                    httpGet,
                    response -> EntityUtils.toString(response.getEntity())
            );
        } catch (IOException e) {
            throw new ClientProtocolException("Unexpected response for request on: " + url);
        }
    }

    private String post(
            @NotBlank final String url,
            @NotNull final Map<String, String> body) throws ClientProtocolException {
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
