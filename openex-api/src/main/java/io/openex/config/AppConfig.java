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

    private final static String ANONYMOUS_USER = "anonymousUser";

    // Validations
    public final static String MANDATORY_MESSAGE = "This value should not be blank.";

    public static User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (ANONYMOUS_USER.equals(principal)) {
            User anonymousUser = new User();
            anonymousUser.setId("anonymous");
            anonymousUser.setEmail("anonymous@openex.io");
            return anonymousUser;
        }
        assert principal instanceof User;
        return (User) principal;
    }

    @Bean
    ObjectMapper openexJsonMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.setDateFormat(new StdDateFormat().withColonInTimeZone(true));
        mapper.registerModule(new Hibernate5Module());
        return mapper;
    }
}
