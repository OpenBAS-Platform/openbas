package io.openbas.utils.fixtures;

import io.openbas.database.model.Organization;

public class OrganizationFixture {

  public static Organization createOrganization() {
    Organization organization = new Organization();
    organization.setName("Filigran test");
    organization.setDescription("Filigran test organization");
    return organization;
  }
}
