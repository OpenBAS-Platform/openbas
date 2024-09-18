package io.openbas.database.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.InjectStatusCommandLine;
import jakarta.annotation.Resource;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;

@Converter(autoApply = true)
public class InjectStatusCommandLineConverter implements AttributeConverter<InjectStatusCommandLine, String> {

    @Resource
    private ObjectMapper mapper;

    @Override
    public String convertToDatabaseColumn(InjectStatusCommandLine meta) {
        try {
            return mapper.writeValueAsString(meta);
        } catch (JsonProcessingException ex) {
            return null;
            // or throw an error
        }
    }

    @Override
    public InjectStatusCommandLine convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return mapper.readValue(dbData, InjectStatusCommandLine.class);
        } catch (IOException ex) {
            // logger.error("Unexpected IOEx decoding json from database: " + dbData);
            return null;
        }
    }

}