package io.openbas.rest.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.Scenario;
import io.openbas.database.raw.RawPaginationImportMapper;
import io.openbas.database.repository.ImportMapperRepository;
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
import io.openbas.service.InjectService;
import io.openbas.service.MapperService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.UnsupportedMediaTypeException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
@RequiredArgsConstructor
public class MapperApi extends RestBehavior {

    private final ImportMapperRepository importMapperRepository;

    private final MapperService mapperService;

    private final InjectService injectService;

    // 25mb in byte
    private static final int MAXIMUM_FILE_SIZE_ALLOWED = 25 * 1000 * 1000;
    private static final List<String> ACCEPTED_FILE_TYPES = List.of("xls", "xlsx");

    @Secured(ROLE_USER)
    @PostMapping("/api/mappers/search")
    public Page<RawPaginationImportMapper> getImportMapper(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        return buildPaginationJPA(
                this.importMapperRepository::findAll,
                searchPaginationInput,
                ImportMapper.class
        ).map(RawPaginationImportMapper::new);
    }

    @Secured(ROLE_USER)
    @GetMapping("/api/mappers/{mapperId}")
    public ImportMapper getImportMapperById(@PathVariable String mapperId) {
        return importMapperRepository.findById(UUID.fromString(mapperId)).orElseThrow(ElementNotFoundException::new);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/mappers")
    public ImportMapper createImportMapper(@RequestBody @Valid final ImportMapperAddInput importMapperAddInput) {
        return mapperService.createAndSaveImportMapper(importMapperAddInput);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping(value="/api/mappers/export")
    public void exportMappers(
        @RequestBody @Valid final ExportMapperInput exportMapperInput,
        HttpServletResponse response) {
        try {
            String jsonMappers = mapperService.exportMappers(exportMapperInput.getIdsToExport());
            String rightNow = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
            String filename = MessageFormat.format("mappers_{0}.json", rightNow);

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

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/mappers/import")
    public void importMappers(@RequestPart("file") @NotNull MultipartFile file) throws ImportException {
        try {
            mapperService.importMappers(mapper.readValue(file.getInputStream().readAllBytes(), new TypeReference<>() {
            }));
        } catch (Exception e) {
            throw new ImportException("Mapper import", "Error during import");
        }
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/mappers/{mapperId}")
    public ImportMapper updateImportMapper(@PathVariable String mapperId, @Valid @RequestBody ImportMapperUpdateInput importMapperUpdateInput) {
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
        return injectService.storeXlsFileForImport(file);
    }

    @PostMapping("/api/mappers/store/{importId}")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Test the import of injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary testImportXLSFile(@PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportTestInput input) {
        ImportMapper importMapper = mapperService.createImportMapper(input.getImportMapper());
        importMapper.getInjectImporters().forEach(
                injectImporter -> {
                    injectImporter.setId(UUID.randomUUID().toString());
                    injectImporter.getRuleAttributes().forEach(ruleAttribute -> ruleAttribute.setId(UUID.randomUUID().toString()));
                }
        );
        Scenario scenario = new Scenario();
        scenario.setRecurrenceStart(Instant.now());
        return injectService.importInjectIntoScenarioFromXLS(scenario, importMapper, importId, input.getName(), input.getTimezoneOffset(), false);
    }

    private void validateUploadedFile(MultipartFile file) {
        validateExtension(file);
        validateFileSize(file);
    }

    private void validateExtension(MultipartFile file) {
        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        if (!ACCEPTED_FILE_TYPES.contains(extension)) {
            throw new UnsupportedMediaTypeException("Only the following file types are accepted : " + String.join(", ", ACCEPTED_FILE_TYPES));
        }
    }

    private void validateFileSize(MultipartFile file){
        if (file.getSize() >= MAXIMUM_FILE_SIZE_ALLOWED) {
            throw new FileTooBigException("File size cannot be greater than 25 Mb");
        }
    }
}
