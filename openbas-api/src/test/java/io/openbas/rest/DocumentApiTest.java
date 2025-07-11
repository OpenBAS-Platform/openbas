package io.openbas.rest;

import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_ARRAY_ORDER;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Challenge;
import io.openbas.database.model.Document;
import io.openbas.database.model.Payload;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.rest.document.form.DocumentRelationsOutput;
import io.openbas.rest.document.form.RelatedEntityOutput;
import io.openbas.utils.fixtures.ChallengeFixture;
import io.openbas.utils.fixtures.DocumentFixture;
import io.openbas.utils.fixtures.FileFixture;
import io.openbas.utils.fixtures.PayloadFixture;
import io.openbas.utils.fixtures.composers.ChallengeComposer;
import io.openbas.utils.fixtures.composers.DocumentComposer;
import io.openbas.utils.fixtures.composers.PayloadComposer;
import io.openbas.utils.fixtures.files.BinaryFile;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(PER_CLASS)
@Transactional
@DisplayName("Document API Integration Tests")
class DocumentApiTest extends IntegrationTest {

  private static final String DOCUMENT_URI = "/api/documents";

  @Resource protected ObjectMapper mapper;

  @Autowired private MockMvc mvc;

  @Autowired DocumentComposer documentComposer;
  @Autowired PayloadComposer payloadComposer;
  @Autowired ChallengeComposer challengeComposer;
  @Autowired private DocumentRepository documentRepository;

  @BeforeAll
  void beforeAll() {
    documentComposer.reset();
  }

  @AfterAll
  void afterAll() {
    documentComposer.reset();
  }

  @Nested
  @DisplayName("Documents CRUD")
  @WithMockAdminUser
  class CRUD {

    @Test
    @DisplayName("Should delete a document")
    void shouldDeleteDocument() throws Exception {
      Document document = new Document();
      document.setName("ToDelete");
      document.setName("ToDelete");
      document.setTarget("TargetDelete");
      document.setType("image");
      documentComposer.forDocument(document).persist();

      payloadComposer
          .forPayload(PayloadFixture.createDefaultFileDrop())
          .withFileDrop(documentComposer.forDocument(document))
          .persist();

      challengeComposer
          .forChallenge(ChallengeFixture.createDefaultChallenge())
          .withDocument(documentComposer.forDocument(document));

      mvc.perform(delete(DOCUMENT_URI + "/" + document.getId())).andExpect(status().isOk());

      Assertions.assertFalse(documentRepository.findById(document.getId()).isPresent());
    }

    @Test
    @DisplayName("Should fetch related entities for a document")
    void shouldFetchRelatedEntities() throws Exception {
      BinaryFile badCoffeeFileContent = FileFixture.getBadCoffeeFileContent();
      Document document1 = DocumentFixture.getDocument(badCoffeeFileContent);

      Payload payload =
          payloadComposer
              .forPayload(PayloadFixture.createDefaultFileDrop())
              .withFileDrop(
                  documentComposer.forDocument(document1).withInMemoryFile(badCoffeeFileContent))
              .persist()
              .get();

      Challenge challenge =
          challengeComposer
              .forChallenge(ChallengeFixture.createDefaultChallenge())
              .withDocument(
                  documentComposer.forDocument(document1).withInMemoryFile(badCoffeeFileContent))
              .persist()
              .get();

      String response =
          mvc.perform(get(DOCUMENT_URI + "/" + document1.getId() + "/relations"))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertNotNull(response);

      DocumentRelationsOutput output =
          DocumentRelationsOutput.builder()
              .payloads(List.of(new RelatedEntityOutput(payload.getId(), payload.getName(), null)))
              .challenges(
                  List.of(new RelatedEntityOutput(challenge.getId(), challenge.getName(), null)))
              .scenarioArticles(Collections.emptyList())
              .simulationArticles(Collections.emptyList())
              .simulations(Collections.emptyList())
              .simulationInjects(Collections.emptyList())
              .scenarioInjects(Collections.emptyList())
              .channels(Collections.emptyList())
              .securityPlatforms(Collections.emptyList())
              .atomicTestings(Collections.emptyList())
              .build();

      String relationJson = mapper.writeValueAsString(output);

      assertThatJson(response).when(IGNORING_ARRAY_ORDER).isEqualTo(relationJson);
    }
  }
}
