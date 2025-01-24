package io.openbas.rest.exercise.service;

import static io.openbas.service.ImportService.EXPORT_ENTRY_ATTACHMENT;
import static io.openbas.service.ImportService.EXPORT_ENTRY_EXERCISE;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Document;
import io.openbas.database.model.Exercise;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.exports.ExerciseFileExport;
import io.openbas.rest.exercise.exports.ExportOptions;
import io.openbas.service.ChallengeService;
import io.openbas.service.FileService;
import io.openbas.service.VariableService;
import jakarta.annotation.Resource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.stereotype.Service;

@Service
public class ExportService {
  private static final Logger LOGGER = Logger.getLogger(ExportService.class.getName());
  @Resource protected ObjectMapper mapper;
  @Resource private DocumentRepository documentRepository;
  @Resource private VariableService variableService;
  @Resource private ChallengeService challengeService;
  @Resource private FileService fileService;

  public String getZipFileName(Exercise exercise, int exportOptionsMask) {
    String infos =
        "("
            + (ExportOptions.has(ExportOptions.WITH_TEAMS, exportOptionsMask)
                ? "with_teams"
                : "no_teams")
            + " & "
            + (ExportOptions.has(ExportOptions.WITH_PLAYERS, exportOptionsMask)
                ? "with_players"
                : "no_players")
            + " & "
            + (ExportOptions.has(ExportOptions.WITH_VARIABLE_VALUES, exportOptionsMask)
                ? "with_variable_values"
                : "no_variable_values")
            + ")";
    return (exercise.getName() + "_" + now().toString()) + "_" + infos + ".zip";
  }

  public byte[] exportExerciseToZip(Exercise exercise, int exportOptionsMask) throws IOException {
    ObjectMapper objectMapper = mapper.copy();

    ExerciseFileExport importExport =
        ExerciseFileExport.fromExercise(exercise, objectMapper, this.challengeService)
            .withOptions(exportOptionsMask);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    ZipOutputStream zipExport = new ZipOutputStream(outputStream);
    ZipEntry zipEntry = new ZipEntry(exercise.getName() + ".json");
    zipEntry.setComment(EXPORT_ENTRY_EXERCISE);
    zipExport.putNextEntry(zipEntry);
    zipExport.write(
        importExport
            .getObjectMapper()
            .writerWithDefaultPrettyPrinter()
            .writeValueAsBytes(importExport));
    zipExport.closeEntry();
    // Add the actual files for the documents
    importExport.getAllDocumentIds().stream()
        .distinct()
        .forEach(
            docId -> {
              Document doc =
                  documentRepository.findById(docId).orElseThrow(ElementNotFoundException::new);
              Optional<InputStream> docStream = fileService.getFile(doc);
              if (docStream.isPresent()) {
                try {
                  ZipEntry zipDoc = new ZipEntry(doc.getTarget());
                  zipDoc.setComment(EXPORT_ENTRY_ATTACHMENT);
                  byte[] data = docStream.get().readAllBytes();
                  zipExport.putNextEntry(zipDoc);
                  zipExport.write(data);
                  zipExport.closeEntry();
                } catch (IOException e) {
                  LOGGER.log(Level.SEVERE, e.getMessage(), e);
                }
              }
            });
    zipExport.finish();
    zipExport.close();

    return outputStream.toByteArray();
  }
}
