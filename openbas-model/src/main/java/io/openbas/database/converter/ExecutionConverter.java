package io.openbas.database.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Execution;
import jakarta.annotation.Resource;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;

@Converter(autoApply = true)
public class ExecutionConverter implements AttributeConverter<Execution, String> {

  @Resource private ObjectMapper mapper;

  @Override
  public String convertToDatabaseColumn(Execution meta) {
    try {
      return mapper.writeValueAsString(meta);
    } catch (JsonProcessingException ex) {
      return null;
      // or throw an error
    }
  }

  @Override
  public Execution convertToEntityAttribute(String dbData) {
    if (dbData == null) {
      return null;
    }
    try {
      return mapper.readValue(dbData, Execution.class);
    } catch (IOException ex) {
      // logger.error("Unexpected IOEx decoding json from database: " + dbData);
      return null;
    }
  }
}
