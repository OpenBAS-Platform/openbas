package io.openex.service;

import io.minio.*;
import io.openex.config.MinioConfig;
import io.openex.database.model.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Optional;

@Service
public class DocumentService {

    private MinioConfig minioConfig;
    private MinioClient minioClient;

    @Autowired
    public void setMinioConfig(MinioConfig minioConfig) {
        this.minioConfig = minioConfig;
    }

    @Autowired
    public void setMinioClient(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public void uploadFile(String name, InputStream data, long size, String contentType) throws Exception {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(minioConfig.getBucket())
                        .object(name)
                        .stream(data, size, -1)
                        .contentType(contentType)
                        .build());
    }

    public void deleteFile(String name) throws Exception {
        minioClient.removeObject(RemoveObjectArgs
                .builder()
                .bucket(minioConfig.getBucket())
                .object(name)
                .build());
    }

    public void uploadFile(String name, MultipartFile file) throws Exception {
        uploadFile(name, file.getInputStream(), file.getSize(), file.getContentType());
    }

    public Optional<InputStream> getFile(Document document) {
        try {
            GetObjectResponse objectStream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(document.getTarget())
                            .build());
            InputStreamResource streamResource = new InputStreamResource(objectStream);
            return Optional.of(streamResource.getInputStream());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
