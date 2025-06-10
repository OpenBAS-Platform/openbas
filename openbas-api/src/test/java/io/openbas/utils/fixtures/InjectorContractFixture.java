package io.openbas.utils.fixtures;

import static io.openbas.database.model.InjectorContract.*;
import static io.openbas.injector_contract.ContractCardinality.Multiple;
import static io.openbas.injector_contract.ContractDef.contractBuilder;
import static io.openbas.injector_contract.fields.ContractAsset.assetField;
import static io.openbas.injector_contract.fields.ContractAssetGroup.assetGroupField;
import static io.openbas.utils.fixtures.InjectorFixture.createDefaultPayloadInjector;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.Payload;
import io.openbas.injector_contract.ContractCardinality;
import io.openbas.injector_contract.ContractDef;
import io.openbas.injector_contract.fields.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.SneakyThrows;
import org.springframework.util.CollectionUtils;

public class InjectorContractFixture {

  private static ObjectNode createDefaultContent(ObjectMapper objectMapper) {
    ObjectNode node = objectMapper.createObjectNode();
    node.set(CONTRACT_CONTENT_FIELDS, objectMapper.valueToTree(new ArrayList<>()));
    return node;
  }

  private static InjectorContract createPayloadInjectorContractInternal(
      Injector injector, Payload payloadCommand, List<ContractCardinalityElement> customContent)
      throws JsonProcessingException {
    InjectorContract injectorContract = new InjectorContract();
    injectorContract.setInjector(injector);
    injectorContract.setPayload(payloadCommand);
    injectorContract.setId(UUID.randomUUID().toString());

    ObjectMapper objectMapper = new ObjectMapper();
    ObjectNode content = createDefaultContent(objectMapper);
    content.set(CONTRACT_CONTENT_FIELDS, objectMapper.valueToTree(customContent));

    injectorContract.setContent(objectMapper.writeValueAsString(content));
    injectorContract.setConvertedContent(content);

    return injectorContract;
  }

  @SneakyThrows
  public static InjectorContract createDefaultInjectorContract() {
    InjectorContract injectorContract = new InjectorContract();
    injectorContract.setInjector(createDefaultPayloadInjector());
    injectorContract.setId(UUID.randomUUID().toString());

    ObjectMapper objectMapper = new ObjectMapper();
    ObjectNode content = createDefaultContent(objectMapper);
    injectorContract.setContent(objectMapper.writeValueAsString(content));
    injectorContract.setConvertedContent(content);
    return injectorContract;
  }

  public static InjectorContract createInjectorContractWithPlatforms(
      Endpoint.PLATFORM_TYPE[] platforms) {
    InjectorContract injectorContract = createDefaultInjectorContract();
    injectorContract.setPlatforms(platforms);
    return injectorContract;
  }

  public static InjectorContract createPayloadInjectorContract(
      Injector injector, Payload payloadCommand) throws JsonProcessingException {
    return createPayloadInjectorContractInternal(injector, payloadCommand, List.of());
  }

  public static InjectorContract createPayloadInjectorContractWithObfuscator(
      Injector injector, Payload payloadCommand) throws JsonProcessingException {
    ContractSelect obfuscatorSelect =
        new ContractSelect("obfuscator", "Obfuscators", ContractCardinality.One);
    obfuscatorSelect.setChoices(Map.of("plain-text", "plain-text", "base64", "base64"));

    return createPayloadInjectorContractInternal(
        injector, payloadCommand, List.of(obfuscatorSelect));
  }

  public static InjectorContract createInjectorContract(Map<String, String> labels, String content)
      throws JsonProcessingException {
    InjectorContract injectorContract = new InjectorContract();
    injectorContract.setId(UUID.randomUUID().toString());
    injectorContract.setLabels(labels);
    injectorContract.setContent(content);
    injectorContract.setConvertedContent(new ObjectMapper().readValue(content, ObjectNode.class));
    injectorContract.setAtomicTesting(true);
    injectorContract.setCreatedAt(Instant.now());
    injectorContract.setUpdatedAt(Instant.now());
    return injectorContract;
  }

  public static InjectorContract createInjectorContract(Map<String, String> labels)
      throws JsonProcessingException {
    String content = "{\"fields\": []}";
    return createInjectorContract(labels, content);
  }

  // -- BUILDER --

  public static void addField(
      InjectorContract injectorContract,
      ObjectMapper mapper,
      List<ContractElement> contractElements)
      throws JsonProcessingException {
    ObjectNode content = mapper.readValue(injectorContract.getContent(), ObjectNode.class);
    List<ContractElement> elements =
        mapper.convertValue(content.get(CONTACT_CONTENT_FIELDS), new TypeReference<>() {});
    if (CollectionUtils.isEmpty(elements)) {
      elements = new ArrayList<>();
    }

    elements.addAll(contractElements);

    content.set(CONTACT_CONTENT_FIELDS, mapper.valueToTree(elements));
    injectorContract.setContent(mapper.writeValueAsString(content));
    injectorContract.setConvertedContent(content);
  }

  public static List<ContractElement> buildAssetField(final boolean mandatory) {
    ContractDef builder = contractBuilder();
    ContractAsset assetField = assetField(CONTACT_ELEMENT_CONTENT_KEY_ASSETS, "Assets", Multiple);
    if (mandatory) {
      builder.mandatory(assetField);
    } else {
      builder.optional(assetField);
    }
    return builder.build();
  }

  public static List<ContractElement> buildMandatoryGroup() {
    ContractAsset assetField = assetField(CONTACT_ELEMENT_CONTENT_KEY_ASSETS, "Assets", Multiple);
    ContractAssetGroup assetGroupField =
        assetGroupField(CONTACT_ELEMENT_CONTENT_KEY_ASSET_GROUPS, "Asset groups", Multiple);
    ContractDef builder = contractBuilder();
    builder.mandatoryGroup(assetField, assetGroupField);
    return builder.build();
  }

  public static List<ContractElement> buildMandatoryOnCondition() {
    ContractAsset assetField = assetField(CONTACT_ELEMENT_CONTENT_KEY_ASSETS, "Assets", Multiple);
    ContractAssetGroup assetGroupField =
        assetGroupField(CONTACT_ELEMENT_CONTENT_KEY_ASSET_GROUPS, "Asset groups", Multiple);
    ContractDef builder = contractBuilder();
    return builder
        .mandatoryOnCondition(assetField, assetGroupField)
        .optional(assetGroupField)
        .build();
  }

  public static List<ContractElement> buildMandatoryOnConditionValue(@NotBlank final String value) {
    ContractAsset assetField = assetField(CONTACT_ELEMENT_CONTENT_KEY_ASSETS, "Assets", Multiple);
    ContractAssetGroup assetGroupField =
        assetGroupField(CONTACT_ELEMENT_CONTENT_KEY_ASSET_GROUPS, "Asset groups", Multiple);
    ContractDef builder = contractBuilder();
    return builder
        .mandatoryOnConditionValue(assetField, assetGroupField, value)
        .optional(assetGroupField)
        .build();
  }
}
