package io.openbas.injectors.opencti.service;

import static io.openbas.database.model.ExecutionTraces.getNewErrorTrace;
import static io.openbas.database.model.ExecutionTraces.getNewSuccessTrace;

import io.openbas.database.model.DataAttachment;
import io.openbas.database.model.Execution;
import io.openbas.database.model.ExecutionTraceAction;
import io.openbas.injectors.opencti.config.OpenCTIConfig;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import org.apache.hc.client5.http.ClientProtocolException;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.HttpStatus;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OpenCTIService {
  private OpenCTIConfig config;

  @Autowired
  public void setConfig(OpenCTIConfig config) {
    this.config = config;
  }

  public void createCase(
      Execution execution, String name, String description, List<DataAttachment> attachments)
      throws Exception {
    try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
      // Prepare the query
      HttpPost httpPost = new HttpPost(config.getUrl());
      httpPost.addHeader("Authorization", "Bearer " + config.getToken());
      httpPost.addHeader("Content-Type", "application/json; charset=utf-8");
      httpPost.addHeader("Accept", "application/json");
      // TODO support attachement
      // if( attachments.size() > 0 ) {
      //    DataAttachment attachment = attachments.get(0);
      // }
      String caseBody =
          String.format(
              "{\"query\": \"mutation { caseIncidentAdd(input: { name: \\\"%s\\\", description: \\\"%s\\\" }) { id } }\"}",
              name, description);
      StringEntity httpBody = new StringEntity(caseBody);
      httpPost.setEntity(httpBody);
      httpClient.execute(
          httpPost,
          classicHttpResponse -> {
            if (classicHttpResponse.getCode() == HttpStatus.SC_OK) {
              String body = EntityUtils.toString(classicHttpResponse.getEntity());
              execution.addTrace(
                  getNewSuccessTrace("Case created (" + body + ")", ExecutionTraceAction.COMPLETE));
              return true;
            } else {
              execution.addTrace(getNewErrorTrace("Fail to POST", ExecutionTraceAction.COMPLETE));
              return false;
            }
          });
    } catch (IOException e) {
      throw new ClientProtocolException(
          "Unexpected response for request on: " + config.getUrl(), e);
    }
  }

  public void createReport(
      Execution execution, String name, String description, List<DataAttachment> attachments)
      throws Exception {
    try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
      // Prepare the query
      HttpPost httpPost = new HttpPost(config.getUrl());
      httpPost.addHeader("Authorization", "Bearer " + config.getToken());
      httpPost.addHeader("Content-Type", "application/json; charset=utf-8");
      httpPost.addHeader("Accept", "application/json");
      // TODO support attachement
      // if( attachments.size() > 0 ) {
      //    DataAttachment attachment = attachments.get(0);
      // }
      String caseBody =
          String.format(
              "{\"query\": \"mutation { reportAdd(input: { name: \\\"%s\\\", description: \\\"%s\\\", published: \\\"%s\\\" }) { id } }\"}",
              name, description, Instant.now().toString());
      StringEntity httpBody = new StringEntity(caseBody);
      httpPost.setEntity(httpBody);
      httpClient.execute(
          httpPost,
          classicHttpResponse -> {
            if (classicHttpResponse.getCode() == HttpStatus.SC_OK) {
              String body = EntityUtils.toString(classicHttpResponse.getEntity());
              execution.addTrace(
                  getNewSuccessTrace(
                      "Report created (" + body + ")", ExecutionTraceAction.COMPLETE));
              return true;
            } else {
              execution.addTrace(getNewErrorTrace("Fail to POST", ExecutionTraceAction.COMPLETE));
              return false;
            }
          });
    } catch (IOException e) {
      throw new ClientProtocolException(
          "Unexpected response for request on: " + config.getUrl(), e);
    }
  }
}
