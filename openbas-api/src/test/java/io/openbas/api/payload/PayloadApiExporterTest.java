package io.openbas.api.payload;

import static io.openbas.rest.payload.PayloadApi.PAYLOAD_URI;
import static io.openbas.utils.fixtures.PayloadFixture.COMMAND_PAYLOAD_NAME;
import static io.openbas.utils.fixtures.PayloadFixture.createDefaultCommand;
import static io.openbas.utils.fixtures.TagFixture.getTagWithText;
import static io.openbas.utilstest.ZipUtils.convertToJson;
import static io.openbas.utilstest.ZipUtils.extractAllFilesFromZip;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.utils.fixtures.composers.PayloadComposer;
import io.openbas.utils.fixtures.composers.TagComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@WithMockAdminUser
@DisplayName("Payload api exporter tests")
class PayloadApiExporterTest extends IntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private PayloadComposer payloadComposer;
  @Autowired private TagComposer tagComposer;

  PayloadComposer.Composer createPayloadComposer() {
    return this.payloadComposer
        .forPayload(createDefaultCommand())
        .withTag(tagComposer.forTag(getTagWithText("malware")))
        .persist();
  }

  @Test
  @DisplayName("Export a payload returns entity")
  void export_payload_returns_payload_with_relationship() throws Exception {
    // -- PREPARE --
    PayloadComposer.Composer wrapper = createPayloadComposer();

    // -- EXECUTE --
    byte[] response =
        mockMvc
            .perform(get(PAYLOAD_URI + "/" + wrapper.get().getId() + "/export"))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    // -- ASSERT --
    assertNotNull(response);
    Map<String, byte[]> files = extractAllFilesFromZip(response);
    Map<String, String> jsonFiles = convertToJson(files);

    // Payload
    String payloadString =
        jsonFiles.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith("command"))
            .map(Map.Entry::getValue)
            .findFirst()
            .get();
    JsonNode payloadJson = new ObjectMapper().readTree(payloadString);
    assertEquals("command", payloadJson.at("/data/type").asText());
    assertEquals(COMMAND_PAYLOAD_NAME, payloadJson.at("/data/attributes/payload_name").asText());
    assertEquals(
        "malware", payloadJson.at("/included").get(0).get("attributes").get("tag_name").asText());
  }
}
