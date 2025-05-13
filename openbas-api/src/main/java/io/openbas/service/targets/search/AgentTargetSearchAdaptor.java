package io.openbas.service.targets.search;

import io.openbas.database.model.Agent;
import io.openbas.database.model.AgentTarget;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTarget;
import io.openbas.database.repository.AgentRepository;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@Component
public class AgentTargetSearchAdaptor extends SearchAdaptorBase {
    private AgentRepository agentRepository;

    public AgentTargetSearchAdaptor(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
        // field name translations
        this.fieldTranslations.put("target_name", "agent_executed_by_user");
        this.fieldTranslations.put("target_endpoint", "agent_asset");
    }

    @Override
    public Page<InjectTarget> search(SearchPaginationInput input, Inject scopedInject) {
        SearchPaginationInput translatedInput = this.translate(input, scopedInject);

        Page<Agent> eps =
                buildPaginationJPA(
                        (Specification<Agent> specification, Pageable pageable) -> this.agentRepository.findAll(specification, pageable),
                        translatedInput,
                        Agent.class);

        return new PageImpl<>(List.of(new AgentTarget("id", "name", Set.of("tag1"), "endpoint", "Crowdstrike")), eps.getPageable(), eps.getTotalElements());
    }

    @Override
    public List<FilterUtilsJpa.Option> getOptionsForInject(Inject scopedInject, String textSearch) {
        throw new NotImplementedException("Not implemented.");
    }

    @Override
    public List<FilterUtilsJpa.Option> getOptionsByIds(List<String> ids) {
        throw new NotImplementedException("Not implemented.");
    }
}
