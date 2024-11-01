package io.openbas.search;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.Base;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class FullTextSearchApi extends RestBehavior {

  public static final String GLOBAL_SEARCH_URI = "/api/fulltextsearch";

  private final FullTextSearchService<? extends Base> fullTextSearchService;

  @PostMapping(GLOBAL_SEARCH_URI)
  public Map<? extends Class<? extends Base>, FullTextSearchService.FullTextSearchCountResult>
      fullTextSearch(@Valid @RequestBody final SearchTerm searchTerm) {
    return this.fullTextSearchService.fullTextSearch(searchTerm.getSearchTerm());
  }

  @PostMapping(GLOBAL_SEARCH_URI + "/{clazz}")
  public Page<FullTextSearchService.FullTextSearchResult> fullTextSearch(
      @PathVariable @NotBlank final String clazz,
      @RequestBody @Valid SearchPaginationInput searchPaginationInput)
      throws ClassNotFoundException {
    return this.fullTextSearchService.fullTextSearch(clazz, searchPaginationInput);
  }

  @Data
  public static class SearchTerm {
    private String searchTerm;
  }
}
