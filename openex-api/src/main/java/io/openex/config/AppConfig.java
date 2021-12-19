package io.openex.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.util.StdDateFormat;
import com.fasterxml.jackson.datatype.hibernate5.Hibernate5Module;
import io.openex.database.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@EnableAsync
public class AppConfig {

    public static User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Validations
    public final static String MANDATORY_MESSAGE = "This value should not be blank.";

    // Default values
    public final static String TECHNICAL_INCIDENT_TYPE = "9ebb419a-5f7d-440c-a84c-6b7132712564";
    public final static String OPERATIONAL_INCIDENT_TYPE = "f324c240-93ec-4092-9c24-32c59920f59e";
    public final static String STRATEGIC_INCIDENT_TYPE = "98bd973d-a121-40ed-a946-8d5408cb21da";

    @Bean
    ObjectMapper openexJsonMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.setDateFormat(new StdDateFormat().withColonInTimeZone(true));
        mapper.registerModule(new Hibernate5Module());
        return mapper;
    }
}
