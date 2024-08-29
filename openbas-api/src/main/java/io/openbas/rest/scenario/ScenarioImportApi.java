package io.openbas.rest.scenario;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.scenario.form.InjectsImportInput;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.service.InjectService;
import io.openbas.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

@RestController
@RequiredArgsConstructor
@Log
public class ScenarioImportApi extends RestBehavior {

    private final InjectService injectService;
    private final ImportMapperRepository importMapperRepository;
    private final ScenarioService scenarioService;

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls/{importId}/dry")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Test the import of injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary dryRunImportXLSFile(@PathVariable @NotBlank final String scenarioId,
                                               @PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportInput input) {
        Scenario scenario = scenarioService.scenario(scenarioId);

        // Getting the mapper to use
        ImportMapper importMapper = importMapperRepository
                .findById(UUID.fromString(input.getImportMapperId()))
                .orElseThrow(() -> new ElementNotFoundException(String.format("The import mapper %s was not found", input.getImportMapperId())));

        return injectService.importInjectIntoScenarioFromXLS(scenario, importMapper, importId, input.getName(), input.getTimezoneOffset(), false);
    }

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls/{importId}/import")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Validate and import injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary validateImportXLSFile(@PathVariable @NotBlank final String scenarioId,
                                               @PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportInput input) {
        Scenario scenario = scenarioService.scenario(scenarioId);

        if(input.getLaunchDate() != null) {
            scenario.setRecurrenceStart(input.getLaunchDate().toInstant());
        }

        // Getting the mapper to use
        ImportMapper importMapper = importMapperRepository
                .findById(UUID.fromString(input.getImportMapperId()))
                .orElseThrow(() -> new ElementNotFoundException(String.format("The import mapper %s was not found", input.getImportMapperId())));

        ImportTestSummary importTestSummary = injectService.importInjectIntoScenarioFromXLS(scenario, importMapper, importId,
            input.getName(), input.getTimezoneOffset(), true);
        scenarioService.updateScenario(scenario);
        return importTestSummary;
    }
}
