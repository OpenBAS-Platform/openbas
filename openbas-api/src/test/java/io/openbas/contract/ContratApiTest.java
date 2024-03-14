package io.openbas.contract;

import io.openbas.IntegrationTest;
import io.openbas.utils.fixtures.ContractFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.PaginationField;
import io.openbas.utils.pagination.SortField;
import org.junit.jupiter.api.*;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.List;

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
    Mockito.when(contractService.searchContracts(any(), any())).thenCallRealMethod();
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
        MultiValueMap<String, String> params = new LinkedMultiValueMap();
        params.add("page", "0");
        params.add("size", "10");

        mvc.perform(post("/api/contracts/search")
                .params(params)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(ContractFixture.getDefault().build()))).andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(5));
      }

      @Test
      @DisplayName("Fetching first page of contracts failed with bad request")
      void given_a_bad_search_input_should_throw_bad_request() throws Exception {
        MultiValueMap<String, String> params = new LinkedMultiValueMap();
        params.add("page", "0");
        params.add("size", "110");

        mvc.perform(post("/api/contracts/search")
                .params(params)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(ContractFixture.getDefault().build())))
            .andExpect(status().isBadRequest());
      }
    }

    @Nested
    @DisplayName("Filtering page of contracts")
    class FilteringPageOfContracts {

      @DisplayName("Fetching first page of contracts by textsearch")
      @Test
      void given_search_input_with_textsearch_should_return_a_page_of_contrats() throws Exception {
        PaginationField paginationField = ContractFixture.getDefault().textSearch("em").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(2));
      }

      @DisplayName("Fetching first page of contracts by textsearch ignoring case")
      @Test
      void given_search_input_with_textsearch_should_return_a_page_of_contrats_ignoring_case() throws Exception {
        PaginationField paginationField = ContractFixture.getDefault().textSearch("http req").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by textsearch with spaces")
      @Test
      void given_search_input_with_textsearch_with_spaces_should_return_a_page_of_contracts() throws Exception {
        PaginationField paginationField = ContractFixture.getDefault().textSearch("E m").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(0));
      }

      @DisplayName("Fetching first page of contracts by type")
      @Test
      void given_search_input_with_type_should_return_a_page_of_contrats() throws Exception {
        PaginationField.Filter filter = new PaginationField.Filter();
        filter.setKey("config.type");
        filter.setValues(List.of("openbas_http"));
        PaginationField.FilterGroup filterGroup = new PaginationField.FilterGroup();
        filterGroup.setFilters(List.of(filter));
        PaginationField paginationField = ContractFixture.getDefault()
            .filterGroup(filterGroup)
            .build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by label type ignoring case")
      @Test
      void given_search_input_with_label_type_should_return_a_page_of_contrats_ignoring_case() throws Exception {
        PaginationField.Filter filter = new PaginationField.Filter();
        filter.setKey("config.label");
        filter.setValues(List.of("http request"));
        PaginationField.FilterGroup filterGroup = new PaginationField.FilterGroup();
        filterGroup.setFilters(List.of(filter));
        PaginationField paginationField = ContractFixture.getDefault()
            .filterGroup(filterGroup)
            .build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by label")
      @Test
      void given_search_input_with_label_should_return_a_page_of_contrats() throws Exception {
        PaginationField.Filter filter = new PaginationField.Filter();
        filter.setKey("label");
        filter.setValues(List.of("HTTP Request - POST (raw body)"));
        PaginationField.FilterGroup filterGroup = new PaginationField.FilterGroup();
        filterGroup.setFilters(List.of(filter));
        PaginationField paginationField = ContractFixture.getDefault()
            .filterGroup(filterGroup)
            .build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.numberOfElements").value(1));
      }

      @DisplayName("Fetching first page of contracts by label email ignoring case")
      @Test
      void given_search_input_with_label_should_return_a_page_of_contrats_ignoring_case() throws Exception {
        PaginationField.Filter filter = new PaginationField.Filter();
        filter.setKey("label");
        filter.setValues(List.of("http request - post (raw body)"));
        PaginationField.FilterGroup filterGroup = new PaginationField.FilterGroup();
        filterGroup.setFilters(List.of(filter));
        PaginationField paginationField = ContractFixture.getDefault()
            .filterGroup(filterGroup)
            .build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
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
        PaginationField paginationField = ContractFixture.getDefault().textSearch("Email").build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.content.[0].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[1].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[1].fields.[0].label").value("Teams"));
      }

      @DisplayName("Sorting by label desc")
      @Test
      void given_sort_input_should_return_a_page_of_contrats_sort_by_label_desc() throws Exception {
        PaginationField paginationField = ContractFixture.getDefault().textSearch("email")
            .sorts(List.of(SortField.builder().property("label").direction("desc").build())).
            build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.content.[0].label.en").value("Send multi-recipients mail"))
            .andExpect(jsonPath("$.content.[1].label.en").value("Send individual mails"));
      }

      @DisplayName("Sorting by type asc and label desc")
      @Test
      void given_sort_input_should_return_a_page_of_contrats_sort_by_type_asc_label_desc() throws Exception {
        PaginationField paginationField = ContractFixture.getDefault().textSearch("email")
            .sorts(List.of(SortField.builder().property("config.type").direction("asc").build(),
                SortField.builder().property("label").direction("desc").build())).
            build();

        mvc.perform(post("/api/contracts/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(paginationField)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.content.[0].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[0].label.en").value("Send multi-recipients mail"))
            .andExpect(jsonPath("$.content.[1].config.label.en").value("Email"))
            .andExpect(jsonPath("$.content.[1].label.en").value("Send individual mails"));
      }
    }
  }
}
