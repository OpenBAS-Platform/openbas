package io.openbas.rest.channel;

import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;
import static io.openbas.rest.channel.ChannelHelper.enrichArticleWithVirtualPublication;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

import io.openbas.database.model.Article;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.ArticleRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.specification.ArticleSpecification;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.rest.channel.output.ArticleOutput;
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
public class ScenarioArticleApi extends RestBehavior {

  private final InjectRepository injectRepository;
  private final ArticleRepository articleRepository;

  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @GetMapping(SCENARIO_URI + "/{scenarioId}/articles")
  @Transactional(readOnly = true)
  public Iterable<ArticleOutput> scenarioArticles(@PathVariable @NotBlank final String scenarioId) {
    List<Inject> injects =
        this.injectRepository.findAll(
            InjectSpecification.fromScenario(scenarioId)
                .and(InjectSpecification.fromContract(CHANNEL_PUBLISH)));
    List<Article> articles =
        this.articleRepository.findAll(ArticleSpecification.fromScenario(scenarioId));
    return enrichArticleWithVirtualPublication(injects, articles, this.mapper).stream()
        .map(ArticleOutput::from)
        .toList();
  }
}
