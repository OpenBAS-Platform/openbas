package io.openbas.rest.injector_contract;

import static io.openbas.rest.injector_contract.InjectorContractApi.INJECTOR_CONTRACT_URL;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.injector_contract.form.InjectorContractAddInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateInput;
import io.openbas.utils.fixtures.InjectorContractFixture;
import io.openbas.utils.fixtures.InjectorFixture;
import io.openbas.utils.fixtures.composers.InjectorContractComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.sql.BatchUpdateException;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.postgresql.util.PSQLException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
@WithMockAdminUser
@DisplayName("Injector Contract API tests")
public class InjectorContractApiTest extends IntegrationTest {
  @Autowired private MockMvc mvc;
  @Autowired private EntityManager em;
  @Autowired private ObjectMapper mapper;
  @Autowired private InjectorFixture injectorFixture;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private InjectorContractComposer injectorContractComposer;

  private final String externalId = "contract external id";

  @Test
  @DisplayName("When external ID is empty, fetching by External ID fails with NOT FOUND")
  void whenExternalIdIsNull_FetchingByExternalIdFailsWithBadRequest() throws Exception {
    mvc.perform(get(INJECTOR_CONTRACT_URL + "//").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Nested
  @DisplayName("When injector contract already exists")
  class WhenInjectorContractAlreadyExists {
    private void createStaticInjectorContract() {
      injectorContractComposer
          .forInjectorContract(
              InjectorContractFixture.createDefaultInjectorContractWithExternalId(externalId))
          .withInjector(injectorFixture.getWellKnownObasImplantInjector())
          .persist();
      em.flush();
      em.clear();
    }

    @BeforeEach
    void beforeEach() {
      createStaticInjectorContract();
    }

    @Test
    @DisplayName("Creating contract with same external ID conflicts in the database")
    void createContractFailsWithConflict() {
      assertThatThrownBy(this::createStaticInjectorContract)
          .hasCauseInstanceOf(BatchUpdateException.class)
          .cause()
          .hasCauseInstanceOf(PSQLException.class)
          .hasMessageContaining(
              "Key (injector_contract_external_id)=(" + externalId + ") already exists");
    }

    @Test
    @DisplayName("Fetching by External ID succeeds")
    void fetchByExternalIdSucceeds() throws Exception {
      String body =
          mvc.perform(
                  get(INJECTOR_CONTRACT_URL + "/" + externalId)
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(body).isEqualTo("{\"fields\":[]}");
    }

    @Test
    @DisplayName("Deleting contract succeeds")
    void deleteContractSucceeds() throws Exception {
      mvc.perform(
              delete(INJECTOR_CONTRACT_URL + "/" + externalId)
                  .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Updating contract succeeds")
    void updateContractSucceeds() throws Exception {
      InjectorContractUpdateInput input = new InjectorContractUpdateInput();
      input.setContent("{\"fields\":[], \"arbitrary_field\": \"test\"}");

      mvc.perform(
              put(INJECTOR_CONTRACT_URL + "/" + externalId)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(mapper.writeValueAsString(input)))
          .andExpect(status().isOk());
    }
  }

  @Nested
  @DisplayName("When injector contract does not already exists")
  class WhenInjectorContractDoesNotAlreadyExists {
    @Test
    @DisplayName("Creating contract succeeds")
    void createContractSucceeds() throws Exception {
      String newId = UUID.randomUUID().toString();
      InjectorContractAddInput input = new InjectorContractAddInput();
      input.setId(newId);
      input.setExternalId(externalId);
      input.setInjectorId(injectorFixture.getWellKnownObasImplantInjector().getId());
      input.setContent("{\"fields\":[]}");

      String response =
          mvc.perform(
                  post(INJECTOR_CONTRACT_URL)
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(mapper.writeValueAsString(input)))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(response)
          .whenIgnoringPaths("injector_contract_created_at", "injector_contract_updated_at")
          .isEqualTo(
              "{\"convertedContent\":null,\"listened\":true,\"injector_contract_id\":\""
                  + newId
                  + "\",\"injector_contract_external_id\":\"contract external id\",\"injector_contract_labels\":null,\"injector_contract_manual\":false,\"injector_contract_content\":\"{\\\"fields\\\":[]}\",\"injector_contract_custom\":true,\"injector_contract_needs_executor\":false,\"injector_contract_platforms\":[],\"injector_contract_payload\":null,\"injector_contract_injector\":\"49229430-b5b5-431f-ba5b-f36f599b0144\",\"injector_contract_attack_patterns\":[],\"injector_contract_atomic_testing\":true,\"injector_contract_import_available\":false,\"injector_contract_arch\":null,\"injector_contract_injector_type\":\"openbas_implant\",\"injector_contract_injector_type_name\":\"OpenBAS Implant\"}");
    }

    @Test
    @DisplayName("Fetching by External ID fails with NOT FOUND")
    void fetchByExternalIdFailsWithNotFound() throws Exception {
      mvc.perform(
              get(INJECTOR_CONTRACT_URL + "/" + externalId).contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deleting contract fails with NOT FOUND")
    void deleteContractFailsWithNotFound() throws Exception {
      mvc.perform(
              delete(INJECTOR_CONTRACT_URL + "/" + externalId)
                  .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Updating contract fails with NOT FOUND")
    void updateContractFailsWithNotFound() throws Exception {
      InjectorContractUpdateInput input = new InjectorContractUpdateInput();
      input.setContent("{\"fields\":[], \"arbitrary_field\": \"test\"}");

      mvc.perform(
              put(INJECTOR_CONTRACT_URL + "/" + externalId)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(mapper.writeValueAsString(input)))
          .andExpect(status().isNotFound());
    }
  }
}
