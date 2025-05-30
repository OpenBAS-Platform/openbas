package io.openbas.rest.mapper;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.io.File.createTempFile;
import static java.time.Instant.now;

import com.fasterxml.jackson.core.type.TypeReference;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.bean.ColumnPositionMappingStrategy;
import com.opencsv.bean.CsvToBean;
import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Tag;
import io.openbas.database.raw.RawPaginationImportMapper;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.asset.endpoint.form.EndpointImport;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.FileTooBigException;
import io.openbas.rest.exception.ImportException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.mapper.form.ExportMapperInput;
import io.openbas.rest.mapper.form.ImportMapperAddInput;
import io.openbas.rest.mapper.form.ImportMapperUpdateInput;
import io.openbas.rest.scenario.form.InjectsImportTestInput;
import io.openbas.rest.scenario.response.ImportPostSummary;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.rest.tag.TagService;
import io.openbas.rest.tag.form.TagCreateInput;
import io.openbas.service.EndpointService;
import io.openbas.service.InjectImportService;
import io.openbas.service.MapperService;
import io.openbas.utils.Constants;
import io.openbas.utils.EndpointMapper;
import io.openbas.utils.TargetType;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.UnsupportedMediaTypeException;

@RestController
@RequiredArgsConstructor
@Log
public class MapperApi extends RestBehavior {

  private final ImportMapperRepository importMapperRepository;
  private final MapperService mapperService;
  private final InjectImportService injectImportService;

  private final EndpointService endpointService;

  private final TagService tagService;


  // 25mb in byte
  private static final int MAXIMUM_FILE_SIZE_ALLOWED = 25 * 1000 * 1000;
  private static final List<String> ACCEPTED_FILE_TYPES = List.of("xls", "xlsx");


  @Secured(ROLE_USER)
  @PostMapping("/api/mappers/search")
  public Page<RawPaginationImportMapper> getImportMapper(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        this.importMapperRepository::findAll, searchPaginationInput, ImportMapper.class)
        .map(RawPaginationImportMapper::new);
  }

  @Secured(ROLE_USER)
  @GetMapping("/api/mappers/{mapperId}")
  public ImportMapper getImportMapperById(@PathVariable String mapperId) {
    return importMapperRepository
        .findById(UUID.fromString(mapperId))
        .orElseThrow(ElementNotFoundException::new);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/mappers")
  public ImportMapper createImportMapper(
      @RequestBody @Valid final ImportMapperAddInput importMapperAddInput) {
    return mapperService.createAndSaveImportMapper(importMapperAddInput);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(value = "/api/mappers/export")
  public void exportMappers(
      @RequestBody @Valid final ExportMapperInput exportMapperInput, HttpServletResponse response) {
    try {
      String jsonMappers = mapperService.exportMappers(exportMapperInput.getIdsToExport());

      String rightNow = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now());
      String name =
          exportMapperInput
              .getName()
              .replace(Constants.IMPORTED_OBJECT_NAME_SUFFIX, "")
              .replace(" ", "");
      String exportFileName = name.length() > 15 ? name.substring(0, 15) : name;
      String filename = MessageFormat.format("{0}-{1}.json", exportFileName, rightNow);

      response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
      response.addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
      response.setStatus(HttpServletResponse.SC_OK);

      response.getOutputStream().write(jsonMappers.getBytes(StandardCharsets.UTF_8));
      response.getOutputStream().flush();
      response.getOutputStream().close();
    } catch (IOException e) {
      throw new RuntimeException("Error during export", e);
    }
  }

  @Operation(description = "Export all datas from a specific target (endpoint,...)")
  @Secured(ROLE_ADMIN)
  @PostMapping(value = "/api/mappers/export/csv")
  @LogExecutionTime
  public void exportMappersCsv(
      @RequestParam TargetType targetType,
      @RequestBody @Valid final SearchPaginationInput input,
      HttpServletResponse response) {
    mapperService.exportMappersCsv(targetType, input, response);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/mappers/import")
  public void importMappers(@RequestPart("file") @NotNull MultipartFile file)
      throws ImportException {
    try {
      mapperService.importMappers(
          mapper.readValue(file.getInputStream().readAllBytes(), new TypeReference<>() {
          }));
    } catch (Exception e) {
      log.severe(e.getMessage());
      throw new ImportException("Mapper import", "Error during import");
    }
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/mappers/{mapperId}")
  @Operation(summary = "Duplicate XLS mapper by id")
  public ImportMapper duplicateMapper(@PathVariable @NotBlank final String mapperId) {
    return mapperService.getDuplicateImportMapper(mapperId);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/mappers/{mapperId}")
  public ImportMapper updateImportMapper(
      @PathVariable String mapperId,
      @Valid @RequestBody ImportMapperUpdateInput importMapperUpdateInput) {
    return mapperService.updateImportMapper(mapperId, importMapperUpdateInput);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/mappers/{mapperId}")
  public void deleteImportMapper(@PathVariable String mapperId) {
    importMapperRepository.deleteById(UUID.fromString(mapperId));
  }

  @PostMapping("/api/mappers/store")
  @Transactional(rollbackOn = Exception.class)
  @Operation(summary = "Import injects into an xls file")
  @Secured(ROLE_USER)
  public ImportPostSummary importXLSFile(@RequestPart("file") @NotNull MultipartFile file) {
    validateUploadedFile(file);
    return injectImportService.storeXlsFileForImport(file);
  }

  @PostMapping("/api/mappers/store/{importId}")
  @Transactional(rollbackOn = Exception.class)
  @Operation(summary = "Test the import of injects from an xls file")
  @Secured(ROLE_USER)
  public ImportTestSummary testImportXLSFile(
      @PathVariable @NotBlank final String importId,
      @Valid @RequestBody final InjectsImportTestInput input) {
    ImportMapper importMapper = mapperService.createImportMapper(input.getImportMapper());
    importMapper
        .getInjectImporters()
        .forEach(
            injectImporter -> {
              injectImporter.setId(UUID.randomUUID().toString());
              injectImporter
                  .getRuleAttributes()
                  .forEach(ruleAttribute -> ruleAttribute.setId(UUID.randomUUID().toString()));
            });
    Scenario scenario = new Scenario();
    scenario.setRecurrenceStart(Instant.now());
    return injectImportService.importInjectIntoScenarioFromXLS(
        scenario, importMapper, importId, input.getName(), input.getTimezoneOffset(), false);
  }

  // -- IMPORT --
  @PostMapping("/api/mappers/csv/import")
  @Transactional(rollbackOn = Exception.class)
  public void importEndpoints(@RequestPart("file") @NotNull MultipartFile file) throws IOException {

    File tempFile = createTempFile("openbas-import-" + now().getEpochSecond(), ".csv");
    FileUtils.copyInputStreamToFile(file.getInputStream(), tempFile);

    CSVParser csvParser = new CSVParserBuilder()
        .withSeparator(',')
        .withIgnoreQuotations(true)
        .build();

    CSVReader csvReader = new CSVReaderBuilder(
        new FileReader(tempFile))
        .withSkipLines(1)
        .withCSVParser(csvParser)
        .build();

    CsvToBean csv = new CsvToBean();
    csv.setCsvReader(csvReader);
    csv.setMappingStrategy(setColumMapping());

    List list = csv.parse();

    for (Object object : list) {
      EndpointImport endpointImport = (EndpointImport) object;
      /*EndpointInput endpointInput = new EndpointInput();
      endpointInput.setName(endpointImport.getName());
      endpointInput.setPlatform(EndpointMapper.toPlatform(endpointImport.getPlatform()));
      endpointInput.setArch(EndpointMapper.toArch(endpointImport.getArch()));
      endpointInput.setHostname(endpointImport.getHostname());
      endpointInput.setIps(endpointImport.getIps());
      endpointInput.setDescription(endpointImport.getDescription());
      endpointInput.setMacAddresses(endpointImport.getMacAddresses());
      Endpoint endpoint = new Endpoint();
      endpoint.setUpdateAttributes(endpointInput);
      List<Tag> tagsForCreation = new ArrayList<>();
      Set<TagCreateInput> endpointImportTags = endpointImport.getTags();
      for (TagCreateInput tag : endpointImportTags) {*/
        /*TagCreateInput tagCreateInput = new TagCreateInput();
        tagCreateInput.setName(tag.getName());
        tagCreateInput.setColor(tag.getColor());*/
        /*tagsForCreation.add(this.tagService.upsertTag(tag));
      }
      endpoint.setTags(iterableToSet(tagsForCreation));
      endpointService.createEndpoint(endpoint);*/
      System.out.println(endpointImport);
    }

  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private static ColumnPositionMappingStrategy setColumMapping() {
    ColumnPositionMappingStrategy strategy = new ColumnPositionMappingStrategy();
    strategy.setType(EndpointImport.class);
    String[] columns = new String[]{"name", "description", "hostname", "ips", "platform", "arch", "macAddresses",
        "tagIds"};
    strategy.setColumnMapping(columns);
    return strategy;
  }

  private void validateUploadedFile(MultipartFile file) {
    validateExtension(file);
    validateFileSize(file);
  }

  private void validateExtension(MultipartFile file) {
    String extension = FilenameUtils.getExtension(file.getOriginalFilename());
    if (!ACCEPTED_FILE_TYPES.contains(extension)) {
      throw new UnsupportedMediaTypeException(
          "Only the following file types are accepted : " + String.join(", ", ACCEPTED_FILE_TYPES));
    }
  }

  private void validateFileSize(MultipartFile file) {
    if (file.getSize() >= MAXIMUM_FILE_SIZE_ALLOWED) {
      throw new FileTooBigException("File size cannot be greater than 25 Mb");
    }
  }
}
