package io.openbas.rest;

import static io.openbas.rest.document.DocumentApi.DOCUMENT_API;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_ARRAY_ORDER;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Challenge;
import io.openbas.database.model.Document;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.rest.document.DocumentService;
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
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(PER_CLASS)
@Transactional
@DisplayName("Document API Integration Tests")
class DocumentApiTest extends IntegrationTest {

  @Resource protected ObjectMapper mapper;
  @Autowired DocumentComposer documentComposer;
  @Autowired ChallengeComposer challengeComposer;
  @Autowired PayloadComposer payloadComposer;
  @Autowired private MockMvc mvc;
  @Autowired private DocumentRepository documentRepository;
  @Autowired private ChallengeRepository challengeRepository;

  @BeforeAll
  void beforeAll() {
    challengeComposer.reset();
    documentComposer.reset();
  }

  @AfterAll
  void afterAll() {
    challengeComposer.reset();
    documentComposer.reset();
  }

  private Document getDocumentWithChallenge() {

    ChallengeComposer.Composer challenge =
        challengeComposer.forChallenge(ChallengeFixture.createDefaultChallenge());

    BinaryFile badCoffeeFileContent = FileFixture.getBadCoffeeFileContent();
    return documentComposer
        .forDocument(DocumentFixture.getDocument(badCoffeeFileContent))
        .withInMemoryFile(badCoffeeFileContent)
        .withChallenge(challenge)
        .persist()
        .get();
  }

  private Document getDocumentWithPayload() {

    PayloadComposer.Composer payload =
        payloadComposer.forPayload(PayloadFixture.createDefaultExecutable());

    BinaryFile badCoffeeFileContent = FileFixture.getBadCoffeeFileContent();
    return documentComposer
        .forDocument(DocumentFixture.getDocument(badCoffeeFileContent))
        .withInMemoryFile(badCoffeeFileContent)
        .withPayloadExecutable(payload)
        .persist()
        .get();
  }

  @Nested
  @DisplayName("Documents CRUD")
  @WithMockAdminUser
  class CRUD {

    @Test
    @DisplayName("Given a document related to a payload should no delete the payload")
    void givenADocumentRelatedToAPayload_ShouldNoDeleteDocument() throws Exception {
      Document document = getDocumentWithPayload();

      mvc.perform(delete(DOCUMENT_API + "/" + document.getId())).andExpect(status().isBadRequest());

      Assertions.assertTrue(documentRepository.findById(document.getId()).isPresent());
    }

    @Test
    @DisplayName("Given a document without related entities should be deleted")
    void givenADocumentWithRelationsShouldBeDeleted() throws Exception {
      Document document = getDocumentWithChallenge();
      Challenge challenge = document.getChallenges().stream().findFirst().get();

      mvc.perform(delete(DOCUMENT_API + "/" + document.getId())).andExpect(status().isOk());

      assertFalse(documentRepository.findById(document.getId()).isPresent());
      assertTrue(challengeRepository.findById(challenge.getId()).isPresent());
    }

    @Test
    @DisplayName("Given a document id Should fetch related entities to this document")
    void givenDocumentShouldFetchRelatedEntities() throws Exception {
      Document document = getDocumentWithChallenge();
      Challenge challenge = document.getChallenges().stream().findFirst().get();

      String response =
          mvc.perform(get(DOCUMENT_API + "/" + document.getId() + "/relations"))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertNotNull(response);

      DocumentRelationsOutput output =
          DocumentRelationsOutput.builder()
              .challenges(
                  Set.of(new RelatedEntityOutput(challenge.getId(), challenge.getName(), null)))
              .build();

      String relationJson = mapper.writeValueAsString(output);

      assertThatJson(response).when(IGNORING_ARRAY_ORDER).isEqualTo(relationJson);
    }
  }

  @Test
  public void encodeDocumentName() {
    Map<String, String> map = new HashMap<>();
    map.put("rapport final.pdf", "rapport%20final.pdf");
    map.put("photo_été.jpeg", "photo_%C3%A9t%C3%A9.jpeg");
    map.put("notes (version 2).txt", "notes%20%28version%202%29.txt");
    map.put("résumé📄.docx", "r%C3%A9sum%C3%A9%F0%9F%93%84.docx");
    map.put("code-source#1.rs", "code-source%231.rs");
    map.put("données_brutes.csv", "donn%C3%A9es_brutes.csv");
    map.put("archive-2025!.zip", "archive-2025%21.zip");
    map.put("🎵_musique.mp3", "%F0%9F%8E%B5_musique.mp3");
    map.put("image@2x.png", "image%402x.png");
    map.put("backup&save.tar.gz", "backup%26save.tar.gz");

    map.put("회의록.docx", "%ED%9A%8C%EC%9D%98%EB%A1%9D.docx");
    map.put("사진_여름.png", "%EC%82%AC%EC%A7%84_%EC%97%AC%EB%A6%84.png");
    map.put("음악🎶.mp3", "%EC%9D%8C%EC%95%85%F0%9F%8E%B6.mp3");

    map.put("报告.pdf", "%E6%8A%A5%E5%91%8A.pdf");
    map.put("照片_夏天.jpg", "%E7%85%A7%E7%89%87_%E5%A4%8F%E5%A4%A9.jpg");
    map.put("音乐文件.mp3", "%E9%9F%B3%E4%B9%90%E6%96%87%E4%BB%B6.mp3");
    for (Map.Entry<String, String> name : map.entrySet()) {
      assertEquals(DocumentService.encodeFileName(name.getKey()), name.getValue());
    }
  }
}
