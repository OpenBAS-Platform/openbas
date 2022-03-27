package io.openex.injects.lade.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openex.contract.ContractDef;
import io.openex.contract.ContractInstance;
import io.openex.contract.fields.ContractSelect;
import io.openex.injects.lade.LadeContract;
import io.openex.injects.lade.config.LadeConfig;
import io.openex.injects.lade.model.LadeWorkzone;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractDependencySelect.dependencySelectField;
import static io.openex.contract.fields.ContractSelect.selectFieldWithDefault;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.injects.lade.LadeContract.TYPE;
import static io.openex.rest.helper.RestBehavior.asStream;
import static java.text.MessageFormat.format;

@Component
public class LadeService {

    private static final Logger LOGGER = Logger.getLogger(LadeService.class.getName());
    private final HttpClient httpclient = HttpClients.createDefault();

    @Resource
    private LadeConfig config;

    @Resource
    private ObjectMapper mapper;

    @Autowired
    public void setConfig(LadeConfig config) {
        this.config = config;
    }

    private String ladeAuthentication() throws Exception {
        HttpPost authPost = new HttpPost(config.getUrl() + "/api/token/issue");
        authPost.setHeader("Accept", "application/json");
        authPost.setHeader("Content-type", "application/json");
        ObjectNode objectNode = mapper.createObjectNode();
        objectNode.set("username", mapper.convertValue(config.getUsername(), JsonNode.class));
        objectNode.set("password", mapper.convertValue(config.getPassword(), JsonNode.class));
        authPost.setEntity(new StringEntity(mapper.writeValueAsString(objectNode)));
        JsonNode auth = httpclient.execute(authPost, postResponse -> {
            String body = EntityUtils.toString(postResponse.getEntity());
            return mapper.readTree(body);
        });
        return auth.get("access_token").asText();
    }

    private HttpGet buildGet(String token, String uri) {
        HttpGet hostGet = new HttpGet(config.getUrl() + uri);
        hostGet.setHeader("lade-authorization", "Bearer " + token);
        return hostGet;
    }

    private Map<String, LadeWorkzone> getWorkzones() throws Exception {
        HttpGet actionsGet = new HttpGet(config.getUrl() + "/api/workzones");
        String token = ladeAuthentication();
        actionsGet.setHeader("lade-authorization", "Bearer " + token);
        JsonNode workzones = httpclient.execute(actionsGet, getResponse -> {
            String body = EntityUtils.toString(getResponse.getEntity());
            return mapper.readTree(body);
        });
        Map<String, LadeWorkzone> zones = new HashMap<>();
        workzones.forEach(jsonNode -> {
            String name = jsonNode.get("name").asText();
            String identifier = jsonNode.get("identifier").asText();
            // FETCH HOSTS
            LadeWorkzone ladeWorkzone = new LadeWorkzone(identifier, name);
            try {
                // Fetch hosts
                HttpGet hostGet = buildGet(token, "/api/workzones/" + identifier + "/hosts");
                JsonNode nodeHosts = httpclient.execute(hostGet, getResponse -> {
                    String body = EntityUtils.toString(getResponse.getEntity());
                    return mapper.readTree(body);
                });
                Map<String, String> hostsByName = new HashMap<>();
                Map<String, String> hostsByIp = new HashMap<>();
                nodeHosts.forEach(nodeHost -> {
                    // String hostIdentifier = nodeHost.get("identifier").asText();
                    String hostname = nodeHost.get("hostname").asText();
                    String os = nodeHost.get("os").asText();
                    hostsByName.put(hostname, hostname + " (" + os + ")");
                    nodeHost.get("nics").forEach(nic -> {
                        String ip = nic.get("ip").asText();
                        hostsByIp.put(ip, hostname + " (" + os + ")" + " - " + ip);
                    });
                });
                ladeWorkzone.setHostsByName(hostsByName);
                ladeWorkzone.setHostsByIp(hostsByIp);
                // Add new built workzone
                zones.put(ladeWorkzone.getId(), ladeWorkzone);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, e.getMessage(), e);
            }
        });
        return zones;
    }

    public List<ContractInstance> buildContracts(LadeContract contract) throws Exception {
        String token = ladeAuthentication();
        Map<String, LadeWorkzone> workzoneContract = getWorkzones();
        Map<String, String> workzoneChoices = new HashMap<>();
        workzoneContract.values().forEach(ladeWorkzone -> workzoneChoices.put(ladeWorkzone.getId(), ladeWorkzone.getName()));
        String defaultChoice = workzoneChoices.keySet().stream().findFirst().orElseThrow();
        ContractSelect workContract = selectFieldWithDefault("workzone", "Workzone", workzoneChoices, defaultChoice);
        Map<String, Map<String, String>> workzoneHostsMap = new HashMap<>();
        workzoneContract.forEach((k, value) -> workzoneHostsMap.put(k, value.getHostsByName()));
        Map<String, Map<String, String>> workzoneHostsIps = new HashMap<>();
        workzoneContract.forEach((k, value) -> workzoneHostsIps.put(k, value.getHostsByIp()));
        List<ContractInstance> contracts = new ArrayList<>();
        HttpGet actionsGet = buildGet(token, "/api/actions");
        JsonNode actions = httpclient.execute(actionsGet, getResponse -> {
            String body = EntityUtils.toString(getResponse.getEntity());
            return mapper.readTree(body);
        });
        Iterator<JsonNode> actionElements = actions.get("data").elements();
        actionElements.forEachRemaining(jsonNode -> {
            ContractDef builder = contractBuilder();
            builder.mandatory(workContract);
            String contractName = jsonNode.get("name").asText();
            String identifier = jsonNode.get("identifier").asText();
            String bundleIdentifier = jsonNode.get("bundle_identifier").asText();
            JsonNode categoryIdentifierNode = jsonNode.get("category_identifier");
            if (!(categoryIdentifierNode instanceof NullNode)) {
                JsonNode specs = jsonNode.get("specs");
                JsonNode source = specs.get("source");
                if (source != null) {
                    builder.mandatory(dependencySelectField("source", "Source",
                            "workzone", workzoneHostsMap));
                }
                JsonNode parameters = specs.get("parameters");
                Iterator<Map.Entry<String, JsonNode>> fields = parameters.fields();
                fields.forEachRemaining(entry -> {
                    String key = entry.getKey();
                    JsonNode parameter = entry.getValue();
                    JsonNode nameNode = parameter.get("name");
                    String name = nameNode != null ? nameNode.asText() : key;
                    List<String> types = asStream(parameter.get("types").elements()).map(JsonNode::asText).toList();
                    if (types.contains("host.nics.ip")) {
                        builder.mandatory(dependencySelectField(key, name, "workzone", workzoneHostsIps));
                    } else if (types.contains("boolean")) {
                        JsonNode defaultNode = parameter.get("default");
                        builder.optional(checkboxField(key, name, defaultNode.booleanValue()));
                    } else if (types.contains("string")) {
                        JsonNode defaultNode = parameter.get("default");
                        builder.optional(textField(key, name, defaultNode != null ? defaultNode.asText() : ""));
                    }
                });
                ContractInstance contractInstance = new ContractInstance(TYPE, contract.isExpose(),
                        identifier, contractName, builder.build());
                contractInstance.addContext("bundle_identifier", bundleIdentifier);
                contracts.add(contractInstance);
            }
        });
        return contracts;
    }

    public String executeAction(String bundleIdentifier, String actionIdentifier, ObjectNode content) throws Exception {
        String workzone = content.get("workzone").asText();
        String uri = format("{0}/api/workzones/{1}/bundles/{2}/actions/{3}/run", config.getUrl(), workzone, bundleIdentifier, actionIdentifier);
        HttpPost runPost = new HttpPost(uri);
        runPost.setHeader("lade-authorization", "Bearer " + ladeAuthentication());
        runPost.setHeader("Accept", "application/json");
        runPost.setHeader("Content-type", "application/json");
        // Generate object to action post
        ObjectNode postContent = mapper.createObjectNode();
        postContent.set("source", mapper.convertValue(content.get("source").asText(), JsonNode.class));
        postContent.set("parameters", content);
        // Remove flatten entries
        content.remove("workzone");
        content.remove("source");
        runPost.setEntity(new StringEntity(mapper.writeValueAsString(postContent)));
        return httpclient.execute(runPost, postResponse -> {
            String body = EntityUtils.toString(postResponse.getEntity());
            ObjectNode resultNode = mapper.readValue(body, ObjectNode.class);
            if (postResponse.getCode() >= 200 && postResponse.getCode() < 300) {
                return resultNode.get("workflow_id").asText();
            } else {
                String message = resultNode.get("message").asText();
                throw new UnsupportedOperationException(message);
            }
        });
    }
}
