package io.openbas.rest.simulation;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.FilterUtilsJpa.Option;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.database.model.User.ROLE_USER;

@RequestMapping(SimulationApi.SIMULATION_URI)
@RestController
@RequiredArgsConstructor
@Secured(ROLE_USER)
public class SimulationApi extends RestBehavior {

  public static final String SIMULATION_URI = "/api/simulations";

  private final SimulationService simulationService;

  // -- OPTION --

  @GetMapping("/options")
  public List<Option> optionsByName(
      @RequestParam(required = false) final String searchText) {
    return this.simulationService.findAllAsOptions(searchText);
  }

  @PostMapping("/options")
  public List<Option> optionsById(@RequestBody final List<String> ids) {
    return this.simulationService.findAllByIdsAsOptions(ids);
  }

}
