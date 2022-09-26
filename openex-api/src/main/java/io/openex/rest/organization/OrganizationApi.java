package io.openex.rest.organization;

import io.openex.database.model.Inject;
import io.openex.database.model.Organization;
import io.openex.database.model.User;
import io.openex.database.repository.InjectRepository;
import io.openex.database.repository.OrganizationRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.organization.form.OrganizationCreateInput;
import io.openex.rest.organization.form.OrganizationUpdateInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.helper.UserHelper.currentUser;
import static java.time.Instant.now;

@RestController
public class OrganizationApi extends RestBehavior {

    private InjectRepository injectRepository;
    private OrganizationRepository organizationRepository;
    private TagRepository tagRepository;
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
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
    @PreAuthorize("isObserver()")
    public Iterable<Organization> organizations() {
        User currentUser = currentUser();
        List<Organization> organizations;
        if (currentUser.isAdmin()) {
            organizations = fromIterable(organizationRepository.findAll());
        } else {
            User local = userRepository.findById(currentUser.getId()).orElseThrow();
            organizations = local.getGroups().stream()
                    .flatMap(group -> group.getOrganizations().stream()).toList();
        }
        Iterable<Inject> injects = injectRepository.findAll();
        return organizations.stream().peek(org -> org.resolveInjects(injects)).toList();
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
        checkOrganizationAccess(userRepository, organizationId);
        Organization organization = organizationRepository.findById(organizationId).orElseThrow();
        organization.setUpdateAttributes(input);
        organization.setUpdatedAt(now());
        organization.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return organizationRepository.save(organization);
    }


    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/organizations/{organizationId}")
    public void deleteOrganization(@PathVariable String organizationId) {
        checkOrganizationAccess(userRepository, organizationId);
        organizationRepository.deleteById(organizationId);
    }
}
