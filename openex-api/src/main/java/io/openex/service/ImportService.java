package io.openex.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.importer.Importer;
import io.openex.importer.V1_DataImporter;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.activation.MimetypesFileTypeMap;
import javax.annotation.Resource;
import javax.transaction.Transactional;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import static java.io.File.createTempFile;
import static java.time.Instant.now;

@Service
public class ImportService {

    public final static String EXPORT_ENTRY_EXERCISE = "Exercise";
    public final static String EXPORT_ENTRY_ATTACHMENT = "Attachment";

    private final Map<Integer, Importer> dataImporters = new HashMap<>();

    @Resource
    protected ObjectMapper mapper;

    private FileService fileService;

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    @Autowired
    public void setV1_dataImporter(V1_DataImporter v1_dataImporter) {
        dataImporters.put(1, v1_dataImporter);
    }

    private void handleDataImport(InputStream inputStream) throws IOException {
        JsonNode importNode = mapper.readTree(inputStream);
        int importVersion = importNode.get("export_version").asInt();
        Importer importer = dataImporters.get(importVersion);
        if (importer != null) {
            importer.importData(importNode);
        } else {
            throw new UnsupportedOperationException("Export with version " + importVersion + " is not supported");
        }
    }

    @Transactional(rollbackOn = Exception.class)
    public void handleFileImport(MultipartFile file) throws Exception {
        // 01. Use a temporary file.
        File tempFile = createTempFile("openex-import-" + now().getEpochSecond(), ".zip");
        FileUtils.copyInputStreamToFile(file.getInputStream(), tempFile);
        // 02. Use this file to load zip with information
        ZipFile zipFile = new ZipFile(tempFile);
        Enumeration<? extends ZipEntry> entries = zipFile.entries();
        // Iter on each element to process it.
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            String entryType = entry.getComment();
            InputStream zipInputStream = zipFile.getInputStream(entry);
            switch (entryType) {
                case EXPORT_ENTRY_EXERCISE -> handleDataImport(zipInputStream);
                case EXPORT_ENTRY_ATTACHMENT -> {
                    String entryName = entry.getName();
                    String contentType = new MimetypesFileTypeMap().getContentType(entryName);
                    fileService.uploadFile(entryName, zipInputStream, entry.getSize(), contentType);
                }
                default -> throw new UnsupportedOperationException("Cant import type " + entryType);
            }
        }
        // 03. Delete the temporary file
        //noinspection ResultOfMethodCallIgnored
        tempFile.delete();
    }
}
