package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Organization;
import io.openbas.database.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OrganizationComposer {
    @Autowired
    OrganizationRepository organizationRepository;

    public class Composer extends InnerComposerBase<Organization> {
        private final Organization organization;

        public Composer(Organization organization) {
            this.organization = organization;
        }

        @Override
        public Composer persist() {
            organizationRepository.save(organization);
            return this;
        }

        @Override
        public Organization get() {
            return this.organization;
        }
    }

    public Composer withOrganization(Organization organization) {
        return new Composer(organization);
    }
}
