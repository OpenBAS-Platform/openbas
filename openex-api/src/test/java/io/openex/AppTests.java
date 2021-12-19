package io.openex;

import io.openex.database.model.IncidentType;
import io.openex.database.repository.IncidentTypeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static io.openex.config.AppConfig.TECHNICAL_INCIDENT_TYPE;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AppTests {

    @Autowired
    private IncidentTypeRepository incidentTypeRepository;

    @Test
    void whenTechnical_thenIncidentTypeShouldBeFound() {
        Optional<IncidentType> technical = incidentTypeRepository.findById(TECHNICAL_INCIDENT_TYPE);
        assertThat(technical.isPresent()).isEqualTo(true);
        IncidentType incidentType = technical.orElseThrow();
        assertThat(incidentType.getName()).isEqualTo("TECHNICAL");
    }
}
