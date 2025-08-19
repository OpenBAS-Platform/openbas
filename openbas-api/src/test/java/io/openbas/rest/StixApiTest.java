package io.openbas.rest;

import static io.openbas.rest.StixApi.STIX_API;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
@Transactional
@WithMockAdminUser
@DisplayName("STIX API Integration Tests")
class StixApiTest extends IntegrationTest {

  @Resource protected ObjectMapper mapper;
  @Autowired private MockMvc mvc;

  private String stixSecurityAssessment;

  @BeforeAll
  void setUp() throws Exception {
    try (FileInputStream fis =
        new FileInputStream("src/test/resources/stix-bundles/security-assessment.json")) {
      stixSecurityAssessment = IOUtils.toString(fis, StandardCharsets.UTF_8);
    }
  }

  @Nested
  @DisplayName("Import STIX Bundles")
  @WithMockAdminUser
  class ImportStixBundles {

    @Test
    @DisplayName("Should create a new scenario from a stix bundle")
    void shouldCreateNewScenario() throws Exception {
      String response =
          mvc.perform(
                  post(STIX_API)
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(stixSecurityAssessment))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();
    }
  }
}
