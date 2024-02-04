package io.openex.injects.opencti.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.DataAttachment;
import io.openex.database.model.Execution;
import io.openex.injects.opencti.config.OpenCTIConfig;
import jakarta.annotation.Resource;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.entity.UrlEncodedFormEntity;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.HttpStatus;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

@Component
public class OpenCTIService {

    private static final String METHOD = "POST";
    @Resource
    private ObjectMapper mapper;

    private OpenCTIConfig config;

    @Autowired
    public void setConfig(OpenCTIConfig config) {
        this.config = config;
    }

    public String createCase(Execution execution, String name, String description, List<DataAttachment> attachments) throws Exception {
        HttpClient httpclient = HttpClients.createDefault();
        // Prepare the query
        HttpPost httpPost = new HttpPost(config.getUrl() + "/graphql");
        httpPost.addHeader("Authorization", "Bearer " + config.getToken());
        httpPost.addHeader("Content-Type","application/json; charset=utf-8");
        httpPost.addHeader("Accept", "application/json");
        // TODO support attachement
        // if( attachments.size() > 0 ) {
        //    DataAttachment attachment = attachments.get(0);
        // }
        String caseBody = String.format("""
                    mutation {
                      caseIncidentAdd(input: { name: "%s", description: "%s" }) {
                        id
                      }
                    }
                """, name, description);
        StringEntity httpBody = new StringEntity(caseBody);
        httpPost.setEntity(httpBody);
        ClassicHttpResponse response = httpclient.execute(httpPost, classicHttpResponse -> classicHttpResponse);
        System.out.println(response.getEntity().toString());
        if (response.getCode() == HttpStatus.SC_OK) {
            return "Case created";
        } else {
            throw new Exception(response.getEntity().toString());
        }
    }

    public String createReport(Execution execution, String name, String description, List<DataAttachment> attachments) throws Exception {
        HttpClient httpclient = HttpClients.createDefault();
        // Prepare the query
        HttpPost httpPost = new HttpPost(config.getUrl() + "/graphql");
        httpPost.addHeader("Authorization", "Bearer " + config.getToken());
        httpPost.addHeader("Content-Type","application/json; charset=utf-8");
        httpPost.addHeader("Accept", "application/json");
        // TODO support attachement
        // if( attachments.size() > 0 ) {
        //    DataAttachment attachment = attachments.get(0);
        // }
        String caseBody = String.format("""
                    mutation {
                      reportAdd(input: { name: "%s", description: "%s" }) {
                        id
                      }
                    }

                """, name, description);
        StringEntity httpBody = new StringEntity(caseBody);
        httpPost.setEntity(httpBody);
        ClassicHttpResponse response = httpclient.execute(httpPost, classicHttpResponse -> classicHttpResponse);
        if (response.getCode() == HttpStatus.SC_OK) {
            return "Case created";
        } else {
            throw new Exception(response.getEntity().toString());
        }
    }
}
