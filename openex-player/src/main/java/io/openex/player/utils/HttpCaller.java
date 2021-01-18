package io.openex.player.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.player.config.OpenExConfig;
import io.openex.player.model.Contract;
import io.openex.player.model.execution.Execution;
import io.openex.player.model.inject.InjectBase;
import io.openex.player.model.inject.InjectContext;
import io.openex.player.model.inject.InjectWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
    public static final String AUTHORIZATION = "X-Authorization-Token";

    private final OpenExConfig config;
    private final HttpRequest injectsRequest;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newHttpClient();

    @Autowired
    private List<Contract> contracts;

    @Autowired
    public HttpCaller(OpenExConfig config) throws URISyntaxException {
        this.config = config;
        injectsRequest = HttpRequest.newBuilder().version(HttpClient.Version.HTTP_1_1)
                .uri(new URI(config.getApi() + config.getInjectUri()))
                .header(AUTHORIZATION, config.getToken())
                .header("Content-Type", "application/json; charset=UTF-8")
                .build();
    }

    public void executionReport(Execution execution, String callbackUrl) throws Exception {
        String reportData = mapper.writeValueAsString(execution);
        HttpRequest httpRequest = HttpRequest.newBuilder().version(HttpClient.Version.HTTP_1_1)
                .uri(new URI(callbackUrl))
                .header(AUTHORIZATION, config.getToken())
                .header("Content-Type", "application/json; charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(reportData))
                .build();
        client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
    }

    public List<InjectWrapper> getInjects() throws IOException, InterruptedException {
        Map<String, Contract> contractsById = contracts.stream().collect(Collectors.toMap(Contract::id, contract -> contract));
        HttpResponse<String> response = client.send(injectsRequest, HttpResponse.BodyHandlers.ofString());
        InjectContext[] injectContexts = mapper.readValue(response.body(), InjectContext[].class);
        return Arrays.stream(injectContexts).map(injectContext -> {
            InjectWrapper execution = new InjectWrapper();
            execution.setContext(injectContext);
            Contract contract = contractsById.get(injectContext.getType());
            try {
                InjectBase injectData = mapper.readValue(injectContext.getData(), contract.dataClass());
                execution.setInject(injectData);
            } catch (JsonProcessingException e) {
                // TODO ADD ERROR LOGGER
                e.printStackTrace();
            }
            return execution;
        }).collect(Collectors.toList());
    }
}
