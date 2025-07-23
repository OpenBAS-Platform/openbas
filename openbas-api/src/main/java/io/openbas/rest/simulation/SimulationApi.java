package io.openbas.rest.simulation;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.aop.RBAC;
import io.openbas.database.model.Action;
import io.openbas.database.model.ResourceType;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.FilterUtilsJpa.Option;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RequestMapping(SimulationApi.SIMULATION_URI)
@RestController
@RequiredArgsConstructor
@Secured(ROLE_USER)
public class SimulationApi extends RestBehavior {

  public static final String SIMULATION_URI = "/api/simulations";

  private final SimulationService simulationService;

  // -- OPTION --

  @GetMapping("/options")
  @RBAC(actionPerformed = Action.READ, resourceType = ResourceType.SIMULATION)
  public List<Option> optionsByName(@RequestParam(required = false) final String searchText) {
    return this.simulationService.findAllAsOptions(searchText);
  }

  @PostMapping("/options")
  @RBAC(actionPerformed = Action.READ, resourceType = ResourceType.SIMULATION)
  public List<Option> optionsById(@RequestBody final List<String> ids) {
    return this.simulationService.findAllByIdsAsOptions(ids);
  }
}
