package io.openbas.database.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.StixRefToExternalRef;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Converter
@RequiredArgsConstructor
public class StixRefToExternalRefConverter implements AttributeConverter<List<StixRefToExternalRef>, String> {
  private final ObjectMapper mapper;

  @Override
  public String convertToDatabaseColumn(List<StixRefToExternalRef> attribute) {
    try {
      return mapper.writeValueAsString(attribute);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public List<StixRefToExternalRef> convertToEntityAttribute(String dbData) {
    try {
      return mapper.readValue(dbData, new TypeReference<>() {});
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }
}
