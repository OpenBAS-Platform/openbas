package io.openex.rest.incident;

import io.openex.database.model.Incident;
import io.openex.database.model.IncidentType;
import io.openex.database.repository.IncidentRepository;
import io.openex.database.repository.IncidentTypeRepository;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;

import static io.openex.database.model.User.ROLE_USER;

@RestController
@RolesAllowed(ROLE_USER)
public class IncidentApi extends RestBehavior {
    private IncidentRepository incidentRepository;
    private IncidentTypeRepository incidentTypeRepository;

    @Autowired
    public void setIncidentTypeRepository(IncidentTypeRepository incidentTypeRepository) {
        this.incidentTypeRepository = incidentTypeRepository;
    }

    @Autowired
    public void setIncidentRepository(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @GetMapping("/api/incidents")
    public Iterable<Incident> incidents() {
        return incidentRepository.findAll();
    }

    @GetMapping("/api/incident_types")
    public Iterable<IncidentType> incidentTypes() {
        return incidentTypeRepository.findAll();
    }
}
