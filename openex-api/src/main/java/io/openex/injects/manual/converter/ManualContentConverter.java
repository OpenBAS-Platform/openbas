package io.openex.injects.manual.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.injects.manual.model.ManualContent;

import javax.annotation.Resource;
import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;

@Converter(autoApply = true)
public class ManualContentConverter implements AttributeConverter<ManualContent, String> {

    @Resource
    private ObjectMapper mapper;

    @Override
    public String convertToDatabaseColumn(ManualContent meta) {
        try {
            return mapper.writeValueAsString(meta);
        } catch (JsonProcessingException ex) {
            return null;
            // or throw an error
        }
    }

    @Override
    public ManualContent convertToEntityAttribute(String dbData) {
        try {
            return mapper.readValue(dbData, ManualContent.class);
        } catch (IOException ex) {
            // logger.error("Unexpected IOEx decoding json from database: " + dbData);
            return null;
        }
    }

}