package io.openex.injects.lade.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.injects.lade.model.LadeContent;

import javax.annotation.Resource;
import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;

@Converter(autoApply = true)
public class LadeContentConverter implements AttributeConverter<LadeContent, String> {

    @Resource
    private ObjectMapper mapper;

    @Override
    public String convertToDatabaseColumn(LadeContent meta) {
        try {
            return mapper.writeValueAsString(meta);
        } catch (JsonProcessingException ex) {
            return null;
            // or throw an error
        }
    }

    @Override
    public LadeContent convertToEntityAttribute(String dbData) {
        try {
            return mapper.readValue(dbData, LadeContent.class);
        } catch (IOException ex) {
            // logger.error("Unexpected IOEx decoding json from database: " + dbData);
            return null;
        }
    }

}