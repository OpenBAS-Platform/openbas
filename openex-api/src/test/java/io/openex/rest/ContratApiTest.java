package io.openex.rest;

import io.openex.IntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestInstance(PER_CLASS)
class ContratApiTest extends IntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Nested
    @DisplayName("Fecthing contracts")
    class FecthingContracts {
        @Nested
        @DisplayName("Fetching a page of contracts")
        class FecthingPageOfContracts {
            @DisplayName("Fetching first page of contracts")
            @Test
            @WithMockUser
            void given_first_page_should_return_a_page_of_contrats() throws Exception {
                MultiValueMap<String, String> params = new LinkedMultiValueMap();
                params.add("page", "1");
                params.add("size", "10");

                mvc.perform(get("/api/contracts").queryParams(params))
                        .andExpect(status().is2xxSuccessful());
            }
        }
    }
}
