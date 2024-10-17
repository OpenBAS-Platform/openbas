package io.openbas.database.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.InjectStatusExecution;
import jakarta.annotation.Resource;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Converter(autoApply = true)
public class InjectStatusExecutionConverter
    implements AttributeConverter<List<InjectStatusExecution>, String> {

  @Resource private ObjectMapper mapper;

  @Override
  public String convertToDatabaseColumn(List<InjectStatusExecution> meta) {
    try {
      return mapper.writeValueAsString(meta);
    } catch (JsonProcessingException ex) {
      return null;
      // or throw an error
    }
  }

  @Override
  public List<InjectStatusExecution> convertToEntityAttribute(String dbData) {
    if (dbData == null) {
      return new ArrayList<>();
    }
    try {
      return mapper.readValue(
          dbData,
          mapper.getTypeFactory().constructCollectionType(List.class, InjectStatusExecution.class));
    } catch (IOException ex) {
      // logger.error("Unexpected IOEx decoding json from database: " + dbData);
      return new ArrayList<>();
    }
  }
}
