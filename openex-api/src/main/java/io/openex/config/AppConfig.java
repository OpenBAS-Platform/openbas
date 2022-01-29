package io.openex.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.util.StdDateFormat;
import com.fasterxml.jackson.datatype.hibernate5.Hibernate5Module;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.openex.database.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Component
@EnableAsync
@EnableTransactionManagement
public class AppConfig {

    private final static String ANONYMOUS_USER = "anonymousUser";

    // Validations
    public final static String EMPTY_MESSAGE = "This list cannot be empty.";
    public final static String MANDATORY_MESSAGE = "This value should not be blank.";
    public final static String NOW_FUTURE_MESSAGE = "This date must be now or in the future.";
    public final static String EMAIL_FORMAT = "This field must be a valid email.";

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
        mapper.registerModule(new Jdk8Module());
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}
