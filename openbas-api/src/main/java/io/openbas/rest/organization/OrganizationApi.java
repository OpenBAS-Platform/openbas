package io.openbas.rest.organization;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Organization;
import io.openbas.database.raw.RawOrganization;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.OrganizationRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.organization.form.OrganizationCreateInput;
import io.openbas.rest.organization.form.OrganizationUpdateInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
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
  public Iterable<RawOrganization> organizations() {
    OpenBASPrincipal currentUser = currentUser();
    List<RawOrganization> organizations;
    if (currentUser.isAdmin()) {
      organizations = fromIterable(organizationRepository.rawAll());
    } else {
      organizations = fromIterable(organizationRepository.rawByUser(currentUser.getId()));
    }
    return organizations;
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/organizations")
  public Organization createOrganization(@Valid @RequestBody OrganizationCreateInput input) {
    Organization organization = new Organization();
    organization.setUpdateAttributes(input);
    organization.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    return organizationRepository.save(organization);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/organizations/{organizationId}")
  public Organization updateOrganization(@PathVariable String organizationId,
      @Valid @RequestBody OrganizationUpdateInput input) {
    checkOrganizationAccess(userRepository, organizationId);
    Organization organization = organizationRepository.findById(organizationId).orElseThrow(ElementNotFoundException::new);
    organization.setUpdateAttributes(input);
    organization.setUpdatedAt(now());
    organization.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    return organizationRepository.save(organization);
  }


  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/organizations/{organizationId}")
  public void deleteOrganization(@PathVariable String organizationId) {
    checkOrganizationAccess(userRepository, organizationId);
    organizationRepository.deleteById(organizationId);
  }
}
