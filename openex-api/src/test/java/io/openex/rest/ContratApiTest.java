package io.openex.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.IntegrationTest;
import io.openex.contract.ContractSearchInput;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestInstance(PER_CLASS)
class ContratApiTest extends IntegrationTest {

    @Autowired
    private MockMvc mvc;

    final ObjectMapper objectMapper = new ObjectMapper();

    private String getSearchInputBody() throws JsonProcessingException {
        return objectMapper.writeValueAsString(ContractSearchInput.builder().exposedContractsOnly(true).build());
    }

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

                mvc.perform(post("/api/contracts").queryParams(params).contentType(MediaType.APPLICATION_JSON).content(getSearchInputBody()))
                        .andExpect(status().is2xxSuccessful());
            }
        }
    }
}
