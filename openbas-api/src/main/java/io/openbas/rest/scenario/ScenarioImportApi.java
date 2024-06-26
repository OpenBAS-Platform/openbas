package io.openbas.rest.scenario;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.scenario.form.InjectsImportInput;
import io.openbas.rest.scenario.response.ImportPostSummary;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.service.InjectService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.UUID;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

@RestController
@RequiredArgsConstructor
@Log
public class ScenarioImportApi extends RestBehavior {


    private final ScenarioRepository scenarioRepository;

    private final InjectRepository injectRepository;

    private final ImportMapperRepository importMapperRepository;

    private final InjectService injectService;

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Import injects into an xls file")
    public ImportPostSummary importXLSFile(@PathVariable @NotBlank final String scenarioId, @RequestPart("file") @NotNull MultipartFile file) {
        ImportPostSummary result = new ImportPostSummary();
        result.setAvailableSheets(new ArrayList<>());
        String fileID = UUID.randomUUID().toString();
        result.setImportId(fileID);
        try {
            Workbook workbook = WorkbookFactory.create(file.getInputStream());
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                result.getAvailableSheets().add(workbook.getSheetName(i));
            }
            Path tempDir = Files.createDirectory(Path.of(System.getProperty("java.io.tmpdir"), fileID));
            Path tempFile = Files.createTempFile(tempDir, null, "." + FilenameUtils.getExtension(file.getOriginalFilename()));
            Files.write(tempFile, file.getBytes());

            tempDir.toFile().deleteOnExit();
            tempFile.toFile().deleteOnExit();
        } catch (Exception ex) {
            log.severe("Error while importing an xls file");
            log.severe(Arrays.toString(ex.getStackTrace()));
            throw new RuntimeException();
        }

        return result;
    }

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls/{importId}/test")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Test the import of injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary testImportXLSFile(@PathVariable @NotBlank final String scenarioId,
                                               @PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportInput input) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);

        ImportMapper importMapper = importMapperRepository
                .findById(UUID.fromString(input.getImportMapperId())).orElseThrow(ElementNotFoundException::new);

        return injectService.importXls(importId, scenario, importMapper, input);
    }

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls/{importId}/validate")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Validate and import injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary validateImportXLSFile(@PathVariable @NotBlank final String scenarioId,
                                               @PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportInput input) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);

        ImportMapper importMapper = importMapperRepository
                .findById(UUID.fromString(input.getImportMapperId())).orElseThrow(ElementNotFoundException::new);

        ImportTestSummary importTestSummary = injectService.importXls(importId, scenario, importMapper, input);
        Iterable<Inject> newInjects = injectRepository.saveAll(importTestSummary.getInjects());
        newInjects.forEach(inject -> {scenario.getInjects().add(inject);});
        scenarioRepository.save(scenario);
        return importTestSummary;
    }
}
