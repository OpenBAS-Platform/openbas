package io.openex.service;

import io.minio.*;
import io.openex.config.MinioConfig;
import io.openex.database.model.Document;
import io.openex.database.model.Exercise;
import io.openex.database.model.Tag;
import io.openex.database.repository.DocumentRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.TagRepository;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static io.openex.rest.helper.RestBehavior.fromIterable;

@Service
public class DocumentService {

    private DocumentRepository documentRepository;
    private TagRepository tagRepository;
    private ExerciseRepository exerciseRepository;
    private MinioConfig minioConfig;
    private MinioClient minioClient;

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

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

    private byte[] streamResolve(InputStream stream) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        IOUtils.copy(stream, baos);
        stream.close();
        // return new ByteArrayInputStream(baos.toByteArray());
        return baos.toByteArray();
    }

    private String computeFileTarget(String name, InputStream stream) throws IOException {
        String extension = FilenameUtils.getExtension(name);
        return DigestUtils.md5Hex(stream) + "." + extension;
    }

    @Transactional
    public Document upload(String name, String description,
                         List<String> exerciseIds, List<String> tagIds,
                         InputStream data, long size, String contentType) throws Exception {
        byte[] dataContent = streamResolve(data);
        String fileTarget = computeFileTarget(name, new ByteArrayInputStream(dataContent));
        Optional<Document> targetDocument = documentRepository.findByTarget(fileTarget);
        if (targetDocument.isPresent()) {
            Document document = targetDocument.get();
            // Compute exercises
            List<Exercise> exercises = new ArrayList<>(document.getExercises());
            List<Exercise> inputExercises = fromIterable(exerciseRepository.findAllById(exerciseIds));
            inputExercises.forEach(inputExercise -> {
                if (!exercises.contains(inputExercise)) {
                    exercises.add(inputExercise);
                }
            });
            document.setExercises(exercises);
            // Compute tags
            List<Tag> tags = new ArrayList<>(document.getTags());
            List<Tag> inputTags = fromIterable(tagRepository.findAllById(tagIds));
            inputTags.forEach(inputTag -> {
                if (!tags.contains(inputTag)) {
                    tags.add(inputTag);
                }
            });
            document.setTags(tags);
            return documentRepository.save(document);
        } else {
            uploadFile(name, new ByteArrayInputStream(dataContent), size, contentType);
            Document document = new Document();
            document.setTarget(fileTarget);
            document.setName(name);
            document.setDescription(description);
            document.setExercises(fromIterable(exerciseRepository.findAllById(exerciseIds)));
            document.setTags(fromIterable(tagRepository.findAllById(tagIds)));
            document.setType(contentType);
            return documentRepository.save(document);
        }
    }
}
