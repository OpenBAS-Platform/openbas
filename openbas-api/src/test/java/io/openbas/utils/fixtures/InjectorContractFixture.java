package io.openbas.utils.fixtures;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.Payload;
import java.util.UUID;

public class InjectorContractFixture {
  public static InjectorContract createPayloadInjectorContract(
      Injector injector, Payload payloadCommand) throws JsonProcessingException {
    InjectorContract injectorContract = new InjectorContract();
    injectorContract.setInjector(injector);
    injectorContract.setPayload(payloadCommand);
    injectorContract.setId(UUID.randomUUID().toString());
    ObjectMapper objectMapper = new ObjectMapper();
    ObjectNode content = objectMapper.createObjectNode();
    content.set("fields", objectMapper.convertValue("none", JsonNode.class));
    injectorContract.setContent(objectMapper.writeValueAsString(content));
    injectorContract.setConvertedContent(content);

    return injectorContract;
  }
}
