package io.openbas.collectors.sentinel.client;

import io.openbas.collectors.sentinel.client.resourcetype.AzureResourceType;
import io.openbas.collectors.sentinel.config.CollectorSentinelConfig;
import io.openbas.collectors.sentinel.utils.InstantUtils;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.Header;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
@ConditionalOnProperty(prefix = "collector.sentinel", name = "enable")
public class AzureRestApiCaller extends RestApiCaller<AzureAuthenticationClient> {

    private static final String AZURE_BASE_URL = "https://management.azure.com";
    private static final String API_VERSION = "2023-12-01-preview";

    public AzureRestApiCaller(
            AzureAuthenticationClient authenticationClient,
            CollectorSentinelConfig collectorSentinelConfig) throws IOException, ExecutionException, InterruptedException {
        super(authenticationClient, collectorSentinelConfig);
    }

    private UriComponentsBuilder buildUri(String resourceTypeParam) {
        String createdTimeParam = LocalDateTime.now(ZoneOffset.UTC)
                .minusMinutes(15L)
                .format(InstantUtils.FORMATTER);
        String url = AZURE_BASE_URL + this.collectorSentinelConfig.getSubscription().getBaseUri() + "/providers/Microsoft.SecurityInsights/";
        return UriComponentsBuilder.fromHttpUrl(url)
                .pathSegment(resourceTypeParam)
                .queryParam(AzureResourceType.API_VERSION.getParam(), API_VERSION)
                .query(AzureResourceType.FILTER_UPDATED_SINCE_GREATER_THAN.getParam() + createdTimeParam);
    }

    public String get(AzureResourceType azureResourceType, String resourceId, Optional<AzureResourceType> relationType) {
        URI uri = buildUri(azureResourceType.getParam())
                .pathSegment(resourceId)
                .pathSegment(relationType.map(AzureResourceType::getParam).orElse(""))
                .build()
                .toUri();
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpGet = new HttpGet(uri);
            // Headers
            for (Header header : this.headers) {
                httpGet.setHeader(header);
            }
            return httpClient.execute(
                    httpGet,
                    response -> EntityUtils.toString(response.getEntity())
            );
        } catch (IOException e) {
            throw new RuntimeException("Unexpected response for request on: " + uri);
        }
    }

    public String post(AzureResourceType azureResourceType, String resourceId, Optional<AzureResourceType> relationType) throws IOException {
        URI uri = buildUri(azureResourceType.getParam())
                .pathSegment(resourceId)
                .pathSegment(relationType.map(AzureResourceType::getParam).orElse(""))
                .build()
                .toUri();
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(uri);
            // Headers
            for (Header header : this.headers) {
                httpPost.setHeader(header);
            }
            StringEntity httpBody = new StringEntity("");
            httpPost.setEntity(httpBody);

            return httpClient.execute(
                    httpPost,
                    response -> EntityUtils.toString(response.getEntity())
            );
        } catch (IOException e) {
            throw new RuntimeException("Unexpected response for request on: " + uri);
        }
    }
}
