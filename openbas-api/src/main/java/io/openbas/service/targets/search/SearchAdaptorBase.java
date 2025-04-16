package io.openbas.service.targets.search;

import io.openbas.database.model.Filters;
import io.openbas.database.model.Inject;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.openbas.utils.pagination.SortField;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class SearchAdaptorBase {
  protected final Map<String, String> fieldTranslations = new HashMap<>();

  public SearchPaginationInput translate(SearchPaginationInput input, Inject scopedInject) {
    SearchPaginationInput newInput = new SearchPaginationInput();

    // swap the filters
    List<Filters.Filter> newFilters = new ArrayList<>();
    for (Filters.Filter filter : input.getFilterGroup().getFilters()) {
      if (fieldTranslations.containsKey(filter.getKey())) {
        Filters.Filter newFilter = new Filters.Filter();
        newFilter.setKey(fieldTranslations.get(filter.getKey()));
        newFilter.setOperator(filter.getOperator());
        newFilter.setValues(filter.getValues());
        newFilter.setMode(filter.getMode());
        newFilters.add(newFilter);
      }
    }

    // avoid double adding this filter if it's already in the collection
    if (newFilters.stream().noneMatch(filter -> filter.getKey().equals("target_inject"))) {
      // add search term on inject scope
      Filters.Filter injectScopeFilter = new Filters.Filter();
      injectScopeFilter.setMode(Filters.FilterMode.and);
      injectScopeFilter.setOperator(Filters.FilterOperator.eq);
      injectScopeFilter.setValues(List.of(scopedInject.getId()));
      injectScopeFilter.setKey(fieldTranslations.get("target_injects"));
      newFilters.add(injectScopeFilter);
    }

    Filters.FilterGroup newFilterGroup = new Filters.FilterGroup();
    newFilterGroup.setFilters(newFilters);
    newInput.setFilterGroup(newFilterGroup);

    // mind the sorts
    List<SortField> newSorts = new ArrayList<>();
    SortField defaultSort = new SortField("target_name", "ASC");
    List<SortField> currentSorts =
        input.getSorts() == null ? List.of(defaultSort) : input.getSorts();
    for (SortField sortField : currentSorts) {
      if (fieldTranslations.containsKey(sortField.property())) {
        newSorts.add(
            new SortField(fieldTranslations.get(sortField.property()), sortField.direction()));
      }
    }

    if (newSorts.isEmpty()) {
      newSorts.add(defaultSort);
    }
    newInput.setSorts(newSorts);

    // copy the rest of the attributes
    newInput.setPage(input.getPage());
    newInput.setSize(input.getSize());
    newInput.setTextSearch(input.getTextSearch());

    return newInput;
  }
}
