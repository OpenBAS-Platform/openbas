package io.openbas.service.targets.search;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTarget;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class TeamTargetSeachAdaptator extends SearchAdaptorBase {
    @Override
    public Page<InjectTarget> search(SearchPaginationInput input, Inject scopedInject) {
        return null;
    }
}
