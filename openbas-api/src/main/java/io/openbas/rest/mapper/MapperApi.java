package io.openbas.rest.mapper;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.Scenario;
import io.openbas.database.raw.RawPaginationImportMapper;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.mapper.form.ImportMapperAddInput;
import io.openbas.rest.mapper.form.ImportMapperUpdateInput;
import io.openbas.rest.scenario.form.InjectsImportTestInput;
import io.openbas.rest.scenario.response.ImportPostSummary;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.service.InjectService;
import io.openbas.service.MapperService;
import io.openbas.service.ScenarioService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
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

    private final ScenarioService scenarioService;

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
        return injectService.storeXlsFileForImport(file);
    }

    @PostMapping("/api/mappers/store/{importId}")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Test the import of injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary testImportXLSFile(@PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportTestInput input) {
        ImportMapper importMapper = mapperService.createImportMapper(input.getImportMapper());
        Scenario scenario = new Scenario();
        scenario.setRecurrenceStart(Instant.now());
        return injectService.importInjectIntoScenarioFromXLS(scenario, importMapper, importId, input.getName(), input.getTimezoneOffset(), false);
    }
}
