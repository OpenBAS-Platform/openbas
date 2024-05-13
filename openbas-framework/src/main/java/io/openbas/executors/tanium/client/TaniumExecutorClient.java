package io.openbas.executors.tanium.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.executors.tanium.model.Endpoint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.hc.client5.http.ClientProtocolException;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class TaniumExecutorClient {

    private static final String KEY_HEADER = "session";

    private final TaniumExecutorConfig config;
    private final CloseableHttpClient httpClient = HttpClientBuilder.create().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // -- AGENTS --

    public List<Endpoint> endpoints() throws ClientProtocolException, JsonProcessingException {
        String query = "{\n" +
                "\tendpoints(filter: {memberOf: {name: \"All Windows\"}}) {\n" +
                "    edges {\n" +
                "      node {\n" +
                "        computerID\n" +
                "        name\n" +
                "        ipAddresses\n" +
                "        macAddresses\n" +
                "        eidLastSeen\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}";
        Map<String, Object> body = new HashMap<>();
        body.put("query", query);
        String jsonResponse = this.post(body);
        return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
        });
    }

    // -- PRIVATE --

    private String post(@NotNull final Map<String, Object> body) throws ClientProtocolException {
        try {
            HttpPost httpPost = new HttpPost(this.config.getGatewayUrl());
            // Headers
            httpPost.addHeader(KEY_HEADER, this.config.getApiKey());
            httpPost.addHeader("content-type", "application/json");
            // Body
            StringEntity entity = new StringEntity(this.objectMapper.writeValueAsString(body));
            httpPost.setEntity(entity);
            return this.httpClient.execute(
                    httpPost,
                    response -> EntityUtils.toString(response.getEntity())
            );
        } catch (IOException e) {
            throw new ClientProtocolException("Unexpected response");
        }
    }
}
