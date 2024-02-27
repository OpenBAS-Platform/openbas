package io.openex.contract;

import io.openex.IntegrationTest;
import io.openex.utils.WithMockAdminUser;
import io.openex.utils.fixtures.ContractFixture;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static io.openex.rest.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestInstance(PER_CLASS)
class ContratApiTest extends IntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Nested
    @WithMockAdminUser
    @DisplayName("Fecthing contracts")
    class FecthingContracts {
        @Nested
        @DisplayName("Fetching a page of contracts")
        class FecthingPageOfContracts {
            @Test
            @DisplayName("Fetching first page of contracts succeed")
            void given_search_input_should_return_a_page_of_contrats() throws Exception {
                MultiValueMap<String, String> params = new LinkedMultiValueMap();
                params.add("page", "0");
                params.add("size", "10");

                mvc.perform(post("/api/contracts")
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
                params.add("size", "21");

                mvc.perform(post("/api/contracts")
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
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().textSearch("em").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.numberOfElements").value(3));
            }

            @DisplayName("Fetching first page of contracts by textsearch ignoring case")
            @Test
            void given_search_input_with_textsearch_should_return_a_page_of_contrats_ignoring_case() throws Exception {
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().textSearch("Em").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.numberOfElements").value(3));
            }

            @DisplayName("Fetching first page of contracts by type")
            @Test
            void given_search_input_with_type_should_return_a_page_of_contrats() throws Exception {
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().type("Challenge").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.numberOfElements").value(1));
            }

            @DisplayName("Fetching first page of contracts by type ignoring case")
            @Test
            void given_search_input_with_type_should_return_a_page_of_contrats_ignoring_case() throws Exception {
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().type("CHALLENGE").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.numberOfElements").value(1));
            }

            @DisplayName("Fetching first page of contracts by label")
            @Test
            void given_search_input_with_label_should_return_a_page_of_contrats() throws Exception {
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().label("Publish challenges").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.numberOfElements").value(1));
            }

            @DisplayName("Fetching first page of contracts by label email ignoring case")
            @Test
            void given_search_input_with_label_should_return_a_page_of_contrats_ignoring_case() throws Exception {
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().label("PUBLISH challenges").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
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
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().textSearch("email").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.content.[0].config.label.en").value("Email"))
                        .andExpect(jsonPath("$.content.[0].label.en").value("Send individual mails"))
                        .andExpect(jsonPath("$.content.[1].config.label.en").value("Email"))
                        .andExpect(jsonPath("$.content.[1].label.en").value("Send multi-recipients mail"))
                        .andExpect(jsonPath("$.content.[2].config.label.en").value("Media pressure"))
                        .andExpect(jsonPath("$.content.[2].label.en").value("Publish channel pressure"))
                        .andExpect(jsonPath("$.content.[2].fields.[4].key").value("emailing"));
            }

            @DisplayName("Sorting by label asc")
            @Test
            void given_sort_input_should_return_a_page_of_contrats_sort_by_label_asc() throws Exception {
                MultiValueMap<String, String> params = new LinkedMultiValueMap();
                params.add("sort", "label:asc");

                ContractSearchInput contractSearchInput = ContractFixture.getDefault().textSearch("email").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .params(params)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.content.[0].label.en").value("Publish channel pressure"))
                        .andExpect(jsonPath("$.content.[1].label.en").value("Send individual mails"))
                        .andExpect(jsonPath("$.content.[2].label.en").value("Send multi-recipients mail"));
            }

            @DisplayName("Sorting by label desc")
            @Test
            void given_sort_input_should_return_a_page_of_contrats_sort_by_label_desc() throws Exception {
                MultiValueMap<String, String> params = new LinkedMultiValueMap();
                params.add("sort", "label:desc");

                ContractSearchInput contractSearchInput = ContractFixture.getDefault().textSearch("email").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .params(params)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.content.[0].label.en").value("Send multi-recipients mail"))
                        .andExpect(jsonPath("$.content.[1].label.en").value("Send individual mails"))
                        .andExpect(jsonPath("$.content.[2].label.en").value("Publish channel pressure"));

            }

            @DisplayName("Sorting by type asc and label desc")
            @Test
            void given_sort_input_should_return_a_page_of_contrats_sort_by_type_asc_label_desc() throws Exception {
                MultiValueMap<String, String> params = new LinkedMultiValueMap();
                params.add("sort", "type:asc, label:desc");

                ContractSearchInput contractSearchInput = ContractFixture.getDefault().textSearch("email").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .params(params)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful())
                        .andExpect(jsonPath("$.content.[0].config.label.en").value("Email"))
                        .andExpect(jsonPath("$.content.[0].label.en").value("Send multi-recipients mail"))
                        .andExpect(jsonPath("$.content.[1].config.label.en").value("Email"))
                        .andExpect(jsonPath("$.content.[1].label.en").value("Send individual mails"))
                        .andExpect(jsonPath("$.content.[2].config.label.en").value("Media pressure"))
                        .andExpect(jsonPath("$.content.[2].label.en").value("Publish channel pressure"));
            }
        }
    }
}
