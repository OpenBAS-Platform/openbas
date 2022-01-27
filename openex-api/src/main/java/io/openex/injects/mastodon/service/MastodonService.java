package io.openex.injects.mastodon.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.handler.codec.http.HttpStatusClass;
import io.openex.database.model.Document;
import io.openex.database.repository.DocumentRepository;
import io.openex.execution.Execution;
import io.openex.execution.ExecutionTrace;
import io.openex.injects.base.InjectAttachment;
import io.openex.injects.mastodon.config.MastodonConfig;
import io.openex.injects.mastodon.model.MastodonAttachment;
import io.openex.service.FileService;
import org.apache.commons.io.IOUtils;
import org.apache.hc.client5.http.classic.*;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.entity.UrlEncodedFormEntity;
import org.apache.hc.client5.http.entity.mime.ByteArrayBody;
import org.apache.hc.client5.http.entity.mime.MultipartEntityBuilder;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.*;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.message.BasicNameValuePair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class MastodonService {

    private DocumentRepository documentRepository;
    private FileService fileService;

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    @Resource
    private MastodonConfig config;

    @Resource
    private ObjectMapper mapper;

    @Autowired
    public void setConfig(MastodonConfig config) {
        this.config = config;
    }

    public List<MastodonAttachment> resolveAttachments(Execution execution, List<InjectAttachment> attachments) {
        List<MastodonAttachment> resolved = new ArrayList<>();
        for (InjectAttachment attachment : attachments) {
            String documentId = attachment.getId();
            Optional<Document> askedDocument = documentRepository.findById(documentId);
            try {
                Document doc = askedDocument.orElseThrow();
                InputStream fileInputStream = fileService.getFile(doc.getName()).orElseThrow();
                byte[] content = IOUtils.toByteArray(fileInputStream);
                resolved.add(new MastodonAttachment(doc.getName(), content, doc.getType()));
            } catch (Exception e) {
                // Can't fetch the attachments, ignore
                String docInfo = askedDocument.map(Document::getName).orElse(documentId);
                String message = "Error getting document " + docInfo;
                execution.addTrace(ExecutionTrace.traceError(getClass().getSimpleName(), message, e));
            }
        }
        return resolved;
    }

    public String sendStatus(Execution execution, String token, String status, List<MastodonAttachment> attachments) throws Exception {
        HttpClient httpclient = HttpClients.createDefault();
        // upload files
        List<String> attachmentIds = new ArrayList<>();
        attachments.forEach(attachment -> {
            HttpPost httpPostAttachment = new HttpPost(config.getUrl() + "/api/v2/media");
            httpPostAttachment.addHeader("Authorization", "Bearer " + token);
            httpPostAttachment.addHeader("Accept", "*/*");
            MultipartEntityBuilder multipartEntity = MultipartEntityBuilder.create();
            HttpEntity entity = multipartEntity.addPart("file", new ByteArrayBody(attachment.data(), ContentType.create(attachment.contentType()), attachment.name())).build();
            httpPostAttachment.setEntity(entity);
            try {
                httpclient.execute(httpPostAttachment, classicHttpResponse -> {
                    if (classicHttpResponse.getCode() == HttpStatus.SC_ACCEPTED) {
                        String body = EntityUtils.toString(classicHttpResponse.getEntity());
                        attachmentIds.add(mapper.readTree(body).get("id").asText());
                        return true;
                    } else {
                        execution.addTrace(ExecutionTrace.traceError(getClass().getSimpleName(), "Cannot upload attachment " + attachment.name(), null));
                        return false;
                    }
                });
            } catch (IOException e) {
                execution.addTrace(ExecutionTrace.traceError(getClass().getSimpleName(), "Cannot upload attachment " + attachment.name(), e));
            }
        });
        Thread.sleep(3000);
        HttpPost httpPostStatus = new HttpPost(config.getUrl() + "/api/v1/statuses");
        httpPostStatus.addHeader("Authorization", "Bearer " + token);
        httpPostStatus.addHeader("Accept", "*/*");
        List<NameValuePair> params = new ArrayList<NameValuePair>();
        params.add(new BasicNameValuePair("status", status));
        attachmentIds.forEach(attachmentId -> {
            params.add(new BasicNameValuePair("media_ids[]", attachmentId));
        });
        httpPostStatus.setEntity(new UrlEncodedFormEntity(params));
        ClassicHttpResponse response = httpclient.execute(httpPostStatus, classicHttpResponse -> classicHttpResponse);
        if (response.getCode() == HttpStatus.SC_OK) {
            return "Mastodon status sent";
        } else {
            throw new Exception(response.getEntity().toString());
        }
    }
}
