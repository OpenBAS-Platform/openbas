package io.openex.service;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Scenario;
import io.openex.database.repository.ScenarioRepository;
import io.openex.rest.scenario.form.ScenarioSimple;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static io.openex.config.SessionHelper.currentUser;
import static io.openex.helper.StreamHelper.fromIterable;

@RequiredArgsConstructor
@Service
public class ScenarioService {

  @Value("${openex.mail.imap.enabled}")
  private boolean imapEnabled;

  @Value("${openex.mail.imap.username}")
  private String imapUsername;

  @Resource
  private OpenExConfig openExConfig;

  private final ScenarioRepository scenarioRepository;
  private final GrantService grantService;

  @Transactional
  public Scenario createScenario(@NotNull final Scenario scenario) {
    if (this.imapEnabled) {
      scenario.setReplyTo(this.imapUsername);
    } else {
      scenario.setReplyTo(this.openExConfig.getDefaultMailer());
    }

    this.grantService.computeGrant(scenario);

    return this.scenarioRepository.save(scenario);
  }

  public List<ScenarioSimple> scenarios() {
    List<Scenario> scenarios;
    if (currentUser().isAdmin()) {
      scenarios = fromIterable(this.scenarioRepository.findAll());
    } else {
      scenarios = this.scenarioRepository.findAllGranted(currentUser().getId());
    }
    return scenarios.stream().map(ScenarioSimple::fromScenario).toList();
  }

  public Scenario scenario(@NotBlank final String scenarioId) {
    return this.scenarioRepository.findById(scenarioId).orElseThrow();
  }

  public void deleteScenario(@NotBlank final String scenarioId) {
    this.scenarioRepository.deleteById(scenarioId);
  }
}
