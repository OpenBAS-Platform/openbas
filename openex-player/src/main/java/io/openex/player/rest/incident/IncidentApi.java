package io.openex.player.rest.incident;

import io.openex.player.model.database.Incident;
import io.openex.player.model.database.IncidentType;
import io.openex.player.repository.IncidentRepository;
import io.openex.player.repository.IncidentTypeRepository;
import io.openex.player.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;

import static io.openex.player.model.database.User.ROLE_USER;

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
