package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Organization;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class OrganizationComposer {
  @Autowired OrganizationRepository organizationRepository;

  public class Composer extends InnerComposerBase<Organization> {
    private final Organization organization;
    private final List<TagComposer.Composer> tagComposers = new ArrayList<>();

    public Composer(Organization organization) {
      this.organization = organization;
    }

    public Composer withTag(TagComposer.Composer tagComposer) {
      tagComposers.add(tagComposer);
      this.tagComposers.add(tagComposer);
      Set<Tag> tempTags = this.organization.getTags();
      tempTags.add(tagComposer.get());
      this.organization.setTags(tempTags);
      return this;
    }

    @Override
    public Composer persist() {
      this.tagComposers.forEach(TagComposer.Composer::persist);
      organizationRepository.save(organization);
      return this;
    }

    @Override
    public Organization get() {
      return this.organization;
    }
  }

  public Composer forOrganization(Organization organization) {
    return new Composer(organization);
  }
}
