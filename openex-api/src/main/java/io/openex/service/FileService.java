package io.openex.service;

import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.openex.config.MinioConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Optional;

@Component
public class FileService {

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

    public void uploadFile(MultipartFile file) throws Exception {
        uploadFile(file.getOriginalFilename(), file.getInputStream(), file.getSize(), file.getContentType());
    }

    public Optional<InputStream> getFile(String fileName) {
        try {
            GetObjectResponse objectStream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(fileName)
                            .build());
            InputStreamResource streamResource = new InputStreamResource(objectStream);
            return Optional.of(streamResource.getInputStream());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
