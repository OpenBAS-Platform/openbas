package io.openbas.service.targets.search;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import io.openbas.service.InjectExpectationService;
import io.openbas.service.targets.search.specifications.SearchSpecificationUtils;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class AgentTargetSearchAdaptor extends SearchAdaptorBase {
  private final AgentRepository agentRepository;
  private final InjectExpectationService injectExpectationService;
  private final SearchSpecificationUtils<Agent> specificationUtils;

  private final List<String> joinPath = List.of("assets", "agents");

  public AgentTargetSearchAdaptor(
      AgentRepository agentRepository,
      InjectExpectationService injectExpectationService,
      SearchSpecificationUtils<Agent> specificationUtils) {
    this.agentRepository = agentRepository;
    this.injectExpectationService = injectExpectationService;
    this.specificationUtils = specificationUtils;
    // field name translations
    this.fieldTranslations.put("target_name", "agent_executed_by_user");
    this.fieldTranslations.put("target_endpoint", "agent_asset");
    this.fieldTranslations.put("target_tags", "agent_tags");
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, Inject scopedInject) {

    Specification<Agent> overallSpec =
        specificationUtils.compileSpecificationForAssetGroupMembership(
            scopedInject, input, joinPath);
    SearchPaginationInput translatedInput = this.translate(input, scopedInject);

    Page<Agent> eps =
        buildPaginationJPA(
            (Specification<Agent> specification, Pageable pageable) -> {
              if (Filters.FilterMode.and.equals(input.getFilterGroup().getMode())) {
                return this.agentRepository.findAll(overallSpec.and(specification), pageable);
              }
              return this.agentRepository.findAll(overallSpec.or(specification), pageable);
            },
            translatedInput,
            Agent.class);

    return new PageImpl<>(
        eps.getContent().stream()
            .map(endpoint -> convertFromAgent(endpoint, scopedInject))
            .toList(),
        eps.getPageable(),
        eps.getTotalElements());
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsForInject(Inject scopedInject, String textSearch) {
    throw new NotImplementedException("Not implemented.");
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsByIds(List<String> ids) {
    throw new NotImplementedException("Not implemented.");
  }

  private InjectTarget convertFromAgent(Agent agent, Inject inject) {
    InjectTarget target =
        new AgentTarget(
            agent.getId(),
            agent.getExecutedByUser(),
            Set.of(),
            agent.getAsset().getId(),
            agent.getExecutor().getType());

    List<AtomicTestingUtils.ExpectationResultsByType> results =
        AtomicTestingUtils.getExpectationResultByTypes(
            injectExpectationService.findMergedExpectationsByInjectAndTargetAndTargetType(
                inject.getId(), target.getId(), target.getTargetType()));

    for (AtomicTestingUtils.ExpectationResultsByType result : results) {
      switch (result.type()) {
        case DETECTION -> target.setTargetDetectionStatus(result.avgResult());
        case PREVENTION -> target.setTargetPreventionStatus(result.avgResult());
        case HUMAN_RESPONSE -> target.setTargetHumanResponseStatus(result.avgResult());
      }
    }

    return target;
  }
}
