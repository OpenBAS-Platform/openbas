package io.openbas.rest;

import static io.openbas.rest.StixApi.STIX_API;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.StixService;
import io.openbas.stix.parsing.ParsingException;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "STIX API", description = "Operations related to STIX bundles")
public class StixApi extends RestBehavior {

  public static final String STIX_API = "/api/stix";

  private final StixService stixService;

  @Transactional(rollbackFor = Exception.class)
  @PostMapping(
      value = STIX_API + "/generate-scenario-from-stix-bundle",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public List<String> generateScenarioFromSTIXBundle(@RequestBody String stixJson)
      throws IOException, ParsingException {
    return stixService.generateScenarioFromSTIXBundle(stixJson);
  }
}
