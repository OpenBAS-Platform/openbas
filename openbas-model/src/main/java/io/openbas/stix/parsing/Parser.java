package io.openbas.stix.parsing;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.types.*;
import io.openbas.stix.types.Integer;
import io.openbas.stix.types.enums.HashingAlgorithms;
import io.openbas.stix.types.inner.ExternalReference;
import io.openbas.stix.types.inner.KillChainPhase;

import java.lang.String;
import java.util.*;
import java.util.List;

public class Parser {
  public Bundle parseBundle(String source) throws JsonProcessingException, ParsingException {
    JsonNode jsonNode = new ObjectMapper().readTree(source);
    if(!jsonNode.has("type") || !"bundle".equals(jsonNode.get("type").asText())) {
      throw new ParsingException("Invalid STIX: not a STIX bundle");
    }

    List<ObjectBase> objects = new ArrayList<>();
    Identifier id =  new Identifier(jsonNode.get("id").asText());
    Iterator<JsonNode> iterator = jsonNode.get("objects").elements();
    while(iterator.hasNext()) {
      JsonNode objectNode = iterator.next();
      objects.add(parseObject(objectNode));
    }
    return new Bundle(id, objects);
  }

  private ObjectBase parseObject(JsonNode propertyNode) throws JsonProcessingException, ParsingException {
    ObjectBase object = new ObjectBase();
    Map<String, BaseType<?>> properties = new HashMap<>();
    Iterator<Map.Entry<java.lang.String, JsonNode>> iterator = propertyNode.fields();
    while(iterator.hasNext()) {
      Map.Entry<java.lang.String, JsonNode> entry = iterator.next();
      properties.put(entry.getKey(), parseProperty(entry.getKey(), entry.getValue()));
    }

    object.setProperties(properties);
    return object;
  }

  private BaseType<?> parseProperty(String propertyName, JsonNode propertyNode) throws JsonProcessingException, ParsingException {
    switch (propertyNode.getNodeType()) {
      case OBJECT:
        if(propertyName.endsWith("hashes")) {
          Map<HashingAlgorithms, String> hashes = new HashMap<>();
          Iterator<Map.Entry<String, JsonNode>> iterator = propertyNode.fields();
          while(iterator.hasNext()) {
            Map.Entry<String, JsonNode> entry = iterator.next();
            hashes.put(HashingAlgorithms.fromValue(entry.getKey()), entry.getValue().asText());
          }
          return new Hashes(hashes);
        } else if(propertyNode.has("source_name")) {
          ExternalReference externalReference = new ExternalReference();
          externalReference.setSourceName(propertyNode.get("source_name").asText());
          if(propertyNode.has("description")) {
            externalReference.setDescription(propertyNode.get("description").asText());
          }
          if(propertyNode.has("external_id")) {
            externalReference.setExternalId(propertyNode.get("external_id").asText());
          }
          if(propertyNode.has("hashes")) {
            externalReference.setHashes((Hashes) parseProperty("hashes", propertyNode.get("hashes")));
          }
          return new Complex<>(externalReference);
        } else if(propertyNode.has("kill_chain_name")) {
          KillChainPhase killChainPhase = new KillChainPhase();
          killChainPhase.setKillChainName(propertyNode.get("kill_chain_name").asText());
          killChainPhase.setPhaseName(propertyNode.get("phase_name").asText());
          return new Complex<>(killChainPhase);
        } else {
          Map<String, BaseType<?>> properties = new HashMap<>();
          Iterator<Map.Entry<String, JsonNode>> iterator = propertyNode.fields();
          while(iterator.hasNext()) {
            Map.Entry<String, JsonNode> entry = iterator.next();
            properties.put(entry.getKey(), parseProperty(entry.getKey(), entry.getValue()));
          }
          return new io.openbas.stix.types.Dictionary(properties);
        }
      case ARRAY:
        List<BaseType<?>> list = new ArrayList<>();
        Iterator<JsonNode> iterator = propertyNode.elements();
        while(iterator.hasNext()) {
          JsonNode node = iterator.next();
          list.add(parseProperty(propertyName, node));
        }
        return new io.openbas.stix.types.List<>(list);
      case STRING:
        if(propertyName.endsWith("_hex")) {
          return new Hex(propertyNode.asText());
        }
        if(propertyName.endsWith("_id")) {
          return new Identifier(propertyNode.asText());
        }
        if(propertyName.endsWith("_bin")) {
          return new Binary(propertyNode.asText());
        }
        return new io.openbas.stix.types.String(propertyNode.asText());
      case NUMBER:
        return new Integer(propertyNode.asInt());
      case BOOLEAN:
        return new io.openbas.stix.types.Boolean(propertyNode.asBoolean());
      case NULL:
        return null;
      default: throw new ParsingException("Invalid STIX: not a STIX property");
    }
  }
}
