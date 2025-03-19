package io.openbas.service;

import static java.io.File.createTempFile;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Scenario;
import io.openbas.importer.ImportException;
import io.openbas.importer.Importer;
import io.openbas.importer.V1_DataImporter;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.io.File;
import java.io.InputStream;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.UnsupportedMediaTypeException;

@Service
public class ImportService {

  public static final String EXPORT_ENTRY_EXERCISE = "Exercise";
  public static final String EXPORT_ENTRY_SCENARIO = "Scenario";
  public static final String EXPORT_ENTRY_ATTACHMENT = "Attachment";

  private final Map<Integer, Importer> dataImporters = new HashMap<>();

  @Resource protected ObjectMapper mapper;

  @Autowired
  public void setV1_dataImporter(V1_DataImporter v1_dataImporter) {
    dataImporters.put(1, v1_dataImporter);
  }

  private void handleDataImport(
      InputStream inputStream,
      Map<String, ImportEntry> docReferences,
      Exercise exercise,
      Scenario scenario) {
    try {
      JsonNode importNode = mapper.readTree(inputStream);
      int importVersion = importNode.get("export_version").asInt();
      Importer importer = dataImporters.get(importVersion);
      if (importer != null) {
        importer.importData(importNode, docReferences, exercise, scenario);
      } else {
        throw new ImportException("Export with version " + importVersion + " is not supported");
      }
    } catch (Exception e) {
      throw new ImportException(e);
    }
  }

  @Transactional(rollbackOn = Exception.class)
  public void handleFileImport(MultipartFile file, Exercise exercise, Scenario scenario)
      throws Exception {
    // 01. Use a temporary file.
    File tempFile = createTempFile("openbas-import-" + now().getEpochSecond(), ".zip");
    FileUtils.copyInputStreamToFile(file.getInputStream(), tempFile);

    try (ZipFile zipFile = new ZipFile(tempFile)) {
      // 02. Use this file to load zip with information
      Enumeration<? extends ZipEntry> entries = zipFile.entries();
      // 01. Iter on each document to create it
      List<InputStream> dataImports = new ArrayList<>();
      Map<String, ImportEntry> docReferences = new HashMap<>();
      while (entries.hasMoreElements()) {
        ZipEntry entry = entries.nextElement();
        String entryType = entry.getComment();
        if (entryType == null) {
          throw new UnsupportedMediaTypeException("Import file is using an incorrect format.");
        }
        InputStream zipInputStream = zipFile.getInputStream(entry);
        switch (entryType) {
          case EXPORT_ENTRY_EXERCISE, EXPORT_ENTRY_SCENARIO -> dataImports.add(zipInputStream);
          case EXPORT_ENTRY_ATTACHMENT ->
              docReferences.put(entry.getName(), new ImportEntry(entry, zipInputStream));
          default ->
              throw new UnsupportedMediaTypeException(
                  "Import file contains an unsupported type: " + entryType);
        }
      }
      // 02. Iter on each element to import
      dataImports.forEach(
          dataStream -> handleDataImport(dataStream, docReferences, exercise, scenario));
    } finally {
      // 03. Delete the temporary file
      //noinspection ResultOfMethodCallIgnored
      tempFile.delete();
    }
  }
}
