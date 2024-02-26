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
            @DisplayName("Fetching first page of contracts")
            void given_search_input_should_return_a_page_of_contrats() throws Exception {
                MultiValueMap<String, String> params = new LinkedMultiValueMap();
                params.add("page", "1");
                params.add("size", "10");

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(ContractFixture.getDefault().build())))
                        .andExpect(status().is2xxSuccessful());
            }

            @DisplayName("Fetching first page of contracts by textsearch")
            @Test
            void given_search_input_with_textsearch_should_return_a_page_of_contrats() throws Exception {
                ContractSearchInput contractSearchInput = ContractFixture.getDefault().textSearch("email").build();

                mvc.perform(post("/api/contracts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(asJsonString(contractSearchInput)))
                        .andExpect(status().is2xxSuccessful());
            }
        }
    }
}
