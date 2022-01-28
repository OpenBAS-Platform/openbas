package io.openex.injects.email.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.injects.email.model.EmailContent;

import javax.annotation.Resource;
import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;

@Converter
public class EmailContentConverter implements AttributeConverter<EmailContent, String> {

    @Resource
    private ObjectMapper mapper;

    @Override
    public String convertToDatabaseColumn(EmailContent meta) {
        try {
            return mapper.writeValueAsString(meta);
        } catch (JsonProcessingException ex) {
            return null;
            // or throw an error
        }
    }

    @Override
    public EmailContent convertToEntityAttribute(String dbData) {
        try {
            return mapper.readValue(dbData, EmailContent.class);
        } catch (IOException ex) {
            // logger.error("Unexpected IOEx decoding json from database: " + dbData);
            return null;
        }
    }

}