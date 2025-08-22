package io.openbas.rest;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.StixService;
import io.openbas.stix.parsing.ParsingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping(StixApi.STIX_API)
@Tag(name = "STIX API", description = "Operations related to STIX bundles")
public class StixApi extends RestBehavior {

  public static final String STIX_API = "/api/stix";

  private final StixService stixService;

  @PostMapping(
      value = "/process-bundle",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Process a STIX bundle",
      description =
          "Processes a STIX bundle and generates related entities such as Scenarios and Injects.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "STIX bundle processed successfully"),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid STIX bundle (e.g., too many security assessments)"),
    @ApiResponse(responseCode = "500", description = "Unexpected server error")
  })
  @Transactional(rollbackFor = Exception.class)
  public ResponseEntity<String> processBundle(@RequestBody String stixJson) {
    try {
      String createdScenario = stixService.processBundle(stixJson);
      return ResponseEntity.ok(createdScenario);
    } catch (ParsingException | IOException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
