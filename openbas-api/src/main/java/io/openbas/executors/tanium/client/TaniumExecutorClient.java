package io.openbas.executors.tanium.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.executors.tanium.model.DataEndpoints;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.hc.client5.http.ClientProtocolException;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class TaniumExecutorClient {

    private static final String KEY_HEADER = "session";

    private final TaniumExecutorConfig config;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // -- ENDPOINTS --

    public DataEndpoints endpoints()  {
        try {
            String query = "{\n" +
                    "\tendpoints(filter: {memberOf: {id: " + this.config.getComputerGroupId() + "}}) {\n" +
                    "    edges {\n" +
                    "      node {\n" +
                    "        id\n" +
                    "        computerID\n" +
                    "        name\n" +
                    "        ipAddresses\n" +
                    "        macAddresses\n" +
                    "        eidLastSeen\n" +
                    "        os { platform }\n" +
                    "        processor { architecture }\n" +
                    "      }\n" +
                    "    }\n" +
                    "  }\n" +
                    "}";
            Map<String, Object> body = new HashMap<>();
            body.put("query", query);
            String jsonResponse = this.post(body);
            return this.objectMapper.readValue(jsonResponse, new TypeReference<>() {
            });
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
    }

    public void executeAction(String endpointId, Integer packageID, String command) {
        try {
            String query = "mutation {\n" +
                    "\tactionCreate(\n" +
                    "  input: { name: \"OpenBAS Action\",  package: { id: " + packageID + ", params: [\"" + command.replace("\\", "\\\\").replace("\"", "\\\"") + "\"] }, targets: { actionGroup: { id: " + this.config.getActionGroupId() + " }, endpoints: [" + endpointId + "] } }\n" +
                    ") {\n " +
                    "    action {\n" +
                    "      id\n" +
                    "    }\n" +
                    "  }\n" +
                    "}";
            Map<String, Object> body = new HashMap<>();
            body.put("query", query);
            this.post(body);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // -- PRIVATE --

    private String post(@NotNull final Map<String, Object> body) throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(this.config.getGatewayUrl());
            // Headers
            httpPost.addHeader(KEY_HEADER, this.config.getApiKey());
            httpPost.addHeader("content-type", "application/json");
            // Body
            StringEntity entity = new StringEntity(this.objectMapper.writeValueAsString(body));
            httpPost.setEntity(entity);
            return httpClient.execute(
                    httpPost,
                    response -> EntityUtils.toString(response.getEntity())
            );
        } catch (IOException e) {
            throw new ClientProtocolException("Unexpected response");
        }
    }
}
