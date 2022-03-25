package io.openex.injects.lade.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.Document;
import io.openex.database.repository.DocumentRepository;
import io.openex.execution.Execution;
import io.openex.execution.ExecutionTrace;
import io.openex.injects.lade.config.LadeConfig;
import io.openex.service.DocumentService;
import org.apache.commons.io.IOUtils;
import org.apache.hc.client5.http.classic.HttpClient;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class LadeService {

    private DocumentRepository documentRepository;
    private DocumentService fileService;

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Autowired
    public void setFileService(DocumentService fileService) {
        this.fileService = fileService;
    }

    @Resource
    private LadeConfig config;

    @Resource
    private ObjectMapper mapper;

    @Autowired
    public void setConfig(LadeConfig config) {
        this.config = config;
    }

    public String sendStatus(Execution execution, String token, String status) throws Exception {
       return null;
    }
}
