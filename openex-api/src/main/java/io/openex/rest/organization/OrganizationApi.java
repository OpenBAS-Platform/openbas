package io.openex.rest.organization;

import io.openex.database.model.Organization;
import io.openex.database.repository.OrganizationRepository;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrganizationApi extends RestBehavior {

    private OrganizationRepository organizationRepository;

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping("/api/organizations")
    public Iterable<Organization> organizations() {
        return organizationRepository.findAll();
    }
}
