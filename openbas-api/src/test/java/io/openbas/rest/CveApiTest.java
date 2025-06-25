package io.openbas.rest;

import static io.openbas.utils.JsonUtils.asJsonString;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Cve;
import io.openbas.database.repository.CveRepository;
import io.openbas.rest.cve.form.CveCreateInput;
import io.openbas.rest.cve.form.CveUpdateInput;
import io.openbas.utils.fixtures.composers.CveComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
@Transactional
@WithMockAdminUser
@DisplayName("CVE API Integration Tests")
class CveApiTest extends IntegrationTest {

  private static final String CVE_URI = "/api/cves";

  @Resource protected ObjectMapper mapper;
  @Autowired private MockMvc mvc;

  @Autowired private CveComposer cveComposer;
  @Autowired private CveRepository cveRepository;

  @BeforeEach
  void setUp() {
    cveComposer.reset();
  }

  @Nested
  @DisplayName("When working with CVEs")
  @WithMockAdminUser
  class WhenWorkingWithCves {

    @Test
    @DisplayName("Should create a new CVE successfully")
    void shouldCreateNewCve() throws Exception {
      CveCreateInput input = new CveCreateInput();
      input.setCveId("CVE-2025-1234");
      input.setCvss(new BigDecimal("5.2"));
      input.setDescription("Test summary for CVE creation");

      String response =
          mvc.perform(
                  post(CVE_URI)
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(asJsonString(input)))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(response).node("cve_cve_id").isEqualTo("CVE-2025-1234");
    }

    @Test
    @DisplayName("Should fetch a CVE by ID")
    void shouldFetchCveById() throws Exception {
      Cve cve = new Cve();
      cve.setCveId("CVE-2025-5678");
      cve.setCvss(new BigDecimal("8.9"));
      cve.setDescription("Test CVE");

      cveComposer.forCve(cve).persist();

      String response =
          mvc.perform(get(CVE_URI + "/" + cve.getId()))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(response).node("cve_cve_id").isEqualTo("CVE-2025-5678");
    }

    @Test
    @DisplayName("Should update an existing CVE")
    void shouldUpdateCve() throws Exception {
      Cve cve = new Cve();
      cve.setCveId("CVE-2025-5679");
      cve.setCvss(new BigDecimal("4.5"));
      cve.setDescription("Old description");
      cveComposer.forCve(cve).persist();

      CveUpdateInput updateInput = new CveUpdateInput();
      updateInput.setDescription("Updated Summary");

      String response =
          mvc.perform(
                  put(CVE_URI + "/" + cve.getId())
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(asJsonString(updateInput)))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Assertions.assertTrue(
          updateInput
              .getDescription()
              .equals(
                  cveRepository.findById(cve.getId()).map(cve1 -> cve1.getDescription()).get()));
    }

    @Test
    @DisplayName("Should delete a CVE")
    void shouldDeleteCve() throws Exception {
      Cve cve = new Cve();
      cve.setCveId("CVE-2025-5679");
      cve.setCvss(new BigDecimal("7.5"));
      cve.setDescription("To be deleted");
      cveComposer.forCve(cve).persist();

      mvc.perform(delete(CVE_URI + "/" + cve.getId())).andExpect(status().isOk());

      Assertions.assertFalse(cveRepository.findById(cve.getId()).isPresent());
    }

    @Test
    @DisplayName("Should return CVEs on search")
    void shouldReturnCvesOnSearch() throws Exception {
      Cve cve = new Cve();
      cve.setCveId("CVE-2024-5679");
      cve.setCvss(new BigDecimal("4.5"));
      cve.setDescription("Cve 1");
      cveComposer.forCve(cve).persist();

      Cve cve1 = new Cve();
      cve1.setCveId("CVE-2025-5671");
      cve1.setCvss(new BigDecimal("1.8"));
      cve1.setDescription("Cve 2");
      cveComposer.forCve(cve1).persist();

      SearchPaginationInput input = new SearchPaginationInput();
      input.setSize(10);
      input.setPage(0);

      String response =
          mvc.perform(
                  post(CVE_URI + "/search")
                      .content(asJsonString(input))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(response)
          .inPath("content[*].cve_cve_id")
          .isArray()
          .contains("CVE-2024-5679", "CVE-2025-5671");
    }
  }
}
