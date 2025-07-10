package io.openbas.rest;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Document;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.utils.fixtures.DocumentFixture;
import io.openbas.utils.fixtures.FileFixture;
import io.openbas.utils.fixtures.PayloadFixture;
import io.openbas.utils.fixtures.composers.DocumentComposer;
import io.openbas.utils.fixtures.composers.PayloadComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestInstance(PER_CLASS)
class DocumentApiTest extends IntegrationTest {

  private static final String DOCUMENT_URI = "/api/documents";

  @Autowired
  private MockMvc mvc;

  @Autowired
  DocumentComposer documentComposer;
  @Autowired
  PayloadComposer payloadComposer;
  @Autowired
  private DocumentRepository documentRepository;

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
    @DisplayName("Should delete a document when there is none references")
    void shouldDeleteDocument() throws Exception {
      Document document = new Document();
      document.setName("ToDelete");
      document.setName("ToDelete");
      document.setTarget("TargetDelete");
      document.setType("image");
      documentComposer.forDocument(document).persist();

      payloadComposer
          .forPayload(PayloadFixture.createDefaultFileDrop())
          .withFileDrop(
              documentComposer
                  .forDocument(
                      DocumentFixture.getDocument(
                          FileFixture.getBadCoffeeFileContent()))
                  .withInMemoryFile(FileFixture.getBadCoffeeFileContent()))
              .persist();

      mvc.perform(delete(DOCUMENT_URI + "/" + document.getId())).andExpect(status().isBadRequest());

      Assertions.assertFalse(documentRepository.findById(document.getId()).isPresent());
    }

    @Test
    @DisplayName("Should not delete a document")
    void shouldDeleteCve() throws Exception {
      Document document = new Document();
      documentComposer.forDocument(document).persist();

      mvc.perform(delete(DOCUMENT_URI + "/" + document.getId())).andExpect(status().isOk());

      Assertions.assertTrue(documentRepository.findById(document.getId()).isPresent());
    }
  }
}
