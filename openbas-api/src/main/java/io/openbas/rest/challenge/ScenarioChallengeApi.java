package io.openbas.rest.challenge;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.rest.challenge.ChallengeHelper.resolveChallengeIds;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

import io.openbas.database.model.Inject;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.rest.challenge.output.ChallengeOutput;
import io.openbas.rest.helper.RestBehavior;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ScenarioChallengeApi extends RestBehavior {

  private final InjectRepository injectRepository;
  private final ChallengeRepository challengeRepository;

  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @GetMapping(SCENARIO_URI + "/{scenarioId}/challenges")
  @Transactional(readOnly = true)
  public Iterable<ChallengeOutput> scenarioChallenges(
      @PathVariable @NotBlank final String scenarioId) {
    List<Inject> injects =
        this.injectRepository.findAll(
            InjectSpecification.fromScenario(scenarioId)
                .and(InjectSpecification.fromContract(CHALLENGE_PUBLISH)));
    List<String> challengeIds = resolveChallengeIds(injects, this.mapper);
    return fromIterable(this.challengeRepository.findAllById(challengeIds)).stream()
        .map(ChallengeOutput::from)
        .peek(c -> c.setScenarioIds(List.of(scenarioId)))
        .toList();
  }
}
