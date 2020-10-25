package io.openex.player.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.player.config.OpenExConfig;
import io.openex.player.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class HttpCaller {

    private final OpenExConfig config;
    private final HttpClient client = HttpClient.newHttpClient();
    private final HttpRequest injectsRequest;
    private final ObjectMapper mapper = new ObjectMapper();
    @Resource
    private Discovery discovery;

    @Autowired
    public HttpCaller(OpenExConfig config) throws URISyntaxException {
        this.config = config;
        injectsRequest = HttpRequest.newBuilder().version(HttpClient.Version.HTTP_1_1)
                .uri(new URI(config.getApi()))
                .header("X-Authorization-Token", config.getToken())
                .header("Content-Type", "application/json; charset=UTF-8")
                .build();
    }

    public void executionReport(Execution execution, String callbackUrl) throws Exception {
        String reportData = mapper.writeValueAsString(execution);
        HttpRequest httpRequest = HttpRequest.newBuilder().version(HttpClient.Version.HTTP_1_1)
                .uri(new URI(callbackUrl))
                .header("X-Authorization-Token", config.getToken())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(reportData))
                .build();
        client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
    }

    public List<Inject> getInjects() throws IOException, InterruptedException {
        Map<String, Contract> contractsById = discovery.contractsById();
        HttpResponse<String> response = client.send(injectsRequest, HttpResponse.BodyHandlers.ofString());
        InjectContext[] injectContexts = mapper.readValue(response.body(), InjectContext[].class);
        return Arrays.stream(injectContexts).map(injectContext -> {
            Inject execution = new Inject();
            execution.setContext(injectContext);
            Contract contract = contractsById.get(injectContext.getType());
            try {
                InjectData injectData = mapper.readValue(injectContext.getData(), contract.dataClass());
                execution.setInject(injectData);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            return execution;
        }).collect(Collectors.toList());
    }
}
