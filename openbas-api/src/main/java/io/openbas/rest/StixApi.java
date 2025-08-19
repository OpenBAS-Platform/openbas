package io.openbas.rest;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.StixService;
import io.openbas.stix.parsing.ParsingException;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stix")
@RequiredArgsConstructor
public class StixApi extends RestBehavior {

  private final StixService stixService;

  @Transactional(rollbackFor = Exception.class)
  @PostMapping(
      value = "/generate-scenario-from-stix-bundle",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public List<String> generateScenarioFromSTIXBundle(@RequestBody String stixJson)
      throws IOException, ParsingException {
    return stixService.generateScenarioFromSTIXBundle(stixJson);
  }
}
