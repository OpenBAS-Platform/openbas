package io.openbas.utils.fixtures;

import io.openbas.database.model.Organization;

public class OrganizationFixture {
    public static Organization getOrganization() {
        Organization organization = new Organization();
        organization.setName("Test Organization");
        organization.setDescription("Test Organization Description");
        return organization;
    }
}
