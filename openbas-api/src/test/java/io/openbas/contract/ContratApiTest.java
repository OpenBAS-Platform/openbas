package io.openbas.contract;

import io.openbas.IntegrationTest;
import io.openbas.utils.fixtures.ContractFixture;
import io.openbas.utils.fixtures.PaginationFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.openbas.utils.pagination.SortField;
import org.junit.jupiter.api.*;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static io.openbas.database.model.Filters.FilterOperator.contains;
import static io.openbas.database.model.Filters.FilterOperator.eq;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestInstance(PER_CLASS)
class ContratApiTest extends IntegrationTest {

  @Autowired
  private MockMvc mvc;

  @MockBean
  private ContractService contractService;

  @BeforeEach
  public void before() {
    Mockito.when(contractService.getContracts()).thenReturn(ContractFixture.getContracts());
    Mockito.when(contractService.searchContracts(any())).thenCallRealMethod();
  }

  @Nested
  @WithMockAdminUser
  @DisplayName("Fetching contracts")
  class FetchingContracts {

    @Nested
    @DisplayName("Fetching a page of contracts")
    class FetchingPageOfContracts {

      @Test
      @DisplayName("Fetching first page of contracts succeed")
      void given_search_input_should_return_a_page_of_contrats() throws Exception {
        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(PaginationFixture.getDefault().build()))).andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(5));
      }

      @Test
      @DisplayName("Fetching first page of contracts failed with bad request")
      void given_a_bad_search_input_should_throw_bad_request() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault()
            .size(110)
            .build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().isBadRequest());
      }
    }

    @Nested
    @DisplayName("Searching page of contracts")
    class SearchingPageOfContracts {

      @DisplayName("Fetching first page of contracts by textsearch")
      @Test
      void given_search_input_with_textsearch_should_return_a_page_of_contrats() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().textSearch("em").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(2));
      }

      @DisplayName("Fetching first page of contracts by textsearch ignoring case")
      @Test
      void given_search_input_with_textsearch_should_return_a_page_of_contrats_ignoring_case() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().textSearch("http req").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by textsearch with spaces")
      @Test
      void given_search_input_with_textsearch_with_spaces_should_return_a_page_of_contracts() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().textSearch("E m").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(0));
      }

    }

    @Nested
    @DisplayName("Filtering page of contracts")
    class FilteringPageOfContracts {

      @DisplayName("Fetching first page of contracts by type")
      @Test
      void given_search_input_with_type_should_return_a_page_of_contrats() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.simpleFilter("config", "openbas_http", eq);

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by label type ignoring case and contains operator")
      @Test
      void given_search_input_with_label_type_should_return_a_page_of_contrats_ignoring_case() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.simpleFilter("label", "http request", contains);

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by label and equals operator")
      @Test
      void given_search_input_with_label_should_return_a_page_of_contrats() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.simpleFilter("label", "HTTP Request - POST (raw body)", eq);

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by label email ignoring case")
      @Test
      void given_search_input_with_label_should_return_a_page_of_contrats_ignoring_case() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.simpleFilter("label", "http request - post (raw body)", eq);

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }
    }

    @Nested
    @DisplayName("Sorting page of contracts")
    class SortingPageOfContracts {

      @DisplayName("Sorting by default")
      @Test
      void given_search_input_without_sort_should_return_a_page_of_contrats_with_default_sort() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().textSearch("Email").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.content.[0].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[1].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[1].fields.[0].label").value("Teams"));
      }

      @DisplayName("Sorting by label desc")
      @Test
      void given_sort_input_should_return_a_page_of_contrats_sort_by_label_desc() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault()
            .textSearch("email")
            .sorts(List.of(SortField.builder().property("label").direction("desc").build()))
            .build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.content.[0].label.en").value("Send multi-recipients mail"))
            .andExpect(jsonPath("$.content.[1].label.en").value("Send individual mails"));
      }

      @DisplayName("Sorting by type asc and label desc")
      @Test
      void given_sort_input_should_return_a_page_of_contrats_sort_by_type_asc_label_desc() throws Exception {
        SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().textSearch("email")
            .sorts(List.of(SortField.builder().property("config").direction("asc").build(),
                SortField.builder().property("label").direction("desc").build())).
            build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.content.[0].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[0].label.en").value("Send multi-recipients mail"))
            .andExpect(jsonPath("$.content.[1].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[1].label.en").value("Send individual mails"));
      }
    }
  }
}
