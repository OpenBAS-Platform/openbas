package io.openbas.rest;

import io.openbas.database.GlobalSearch;
import io.openbas.database.GlobalSearch.GlobalSearchResult;
import io.openbas.rest.helper.RestBehavior;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static io.openbas.database.model.User.ROLE_USER;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class GlobalSearchApi extends RestBehavior {

  public static final String GLOBAL_SEARCH_URI = "/api/globalsearch";

  private final GlobalSearch globalSearch;

  @PostMapping(GLOBAL_SEARCH_URI)
  public List<GlobalSearchResult> globalSearch(@Valid @RequestBody final SearchTerm searchTerm) {
    return this.globalSearch.globalSearch(searchTerm.getSearchTerm());
  }

  // Fixme: use pagination object
  @Data
  public static class SearchTerm {
    private String searchTerm;
  }

}
