package io.openbas.rest;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.utils.TargetType;
import io.openbas.utils.fixtures.EndpointFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@TestInstance(PER_CLASS)
public class ImportExportMapperApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private EndpointRepository endpointRepository;

  @DisplayName("Test testing an import xls")
  @Test
  @WithMockAdminUser
  void testExportCsv() throws Exception {
    // -- PREPARE --
    endpointRepository.save(EndpointFixture.createEndpoint());

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                MockMvcRequestBuilders.post(
                        "/api/mappers/export/csv?targetType=" + TargetType.ENDPOINTS)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(new SearchPaginationInput())))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }
}
