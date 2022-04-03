package io.openex.rest.organization;

import io.openex.database.model.Organization;
import io.openex.database.model.basic.BasicInject;
import io.openex.database.repository.OrganizationRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.repository.basic.BasicInjectRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.organization.form.OrganizationCreateInput;
import io.openex.rest.organization.form.OrganizationUpdateInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RestController
public class OrganizationApi<T> extends RestBehavior {

    private BasicInjectRepository basicInjectRepository;
    private OrganizationRepository organizationRepository;
    private TagRepository tagRepository;

    @Autowired
    public void setBasicInjectRepository(BasicInjectRepository basicInjectRepository) {
        this.basicInjectRepository = basicInjectRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping("/api/organizations")
    public Iterable<Organization> organizations() {
        Iterable<BasicInject> injects = basicInjectRepository.findAll();
        return fromIterable(organizationRepository.findAll()).stream()
                .peek(org -> org.resolveInjects(injects)).toList();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/organizations")
    public Organization createOrganization(@Valid @RequestBody OrganizationCreateInput input) {
        Organization organization = new Organization();
        organization.setUpdateAttributes(input);
        organization.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return organizationRepository.save(organization);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/organizations/{organizationId}")
    public Organization updateOrganization(@PathVariable String organizationId,
                                           @Valid @RequestBody OrganizationUpdateInput input) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow();
        organization.setUpdateAttributes(input);
        organization.setUpdatedAt(now());
        organization.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return organizationRepository.save(organization);
    }


    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/organizations/{organizationId}")
    public void deleteOrganization(@PathVariable String organizationId) {
        organizationRepository.deleteById(organizationId);
    }
}
