package io.openbas.service.targets.search;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTarget;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AgentTargetSearchAdaptor extends SearchAdaptorBase {

    public AgentTargetSearchAdaptor() {
        // field name translations
        this.fieldTranslations.put("target_name", "agent_executed_by_user");
        this.fieldTranslations.put("target_tags", "agent_tags");
    }

    @Override
    public Page<InjectTarget> search(SearchPaginationInput input, Inject scopedInject) {
        return null;
    }

    @Override
    public List<FilterUtilsJpa.Option> getOptionsForInject(Inject scopedInject, String textSearch) {
        return List.of();
    }

    @Override
    public List<FilterUtilsJpa.Option> getOptionsByIds(List<String> ids) {
        return List.of();
    }
}
