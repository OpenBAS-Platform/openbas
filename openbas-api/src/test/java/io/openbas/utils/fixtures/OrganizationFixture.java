package io.openbas.utils.fixtures;

import io.openbas.database.model.Organization;

public class OrganizationFixture {

  public static final String ORGANIZATION_FIXTURE_NAME = "Filigran test";

  public static Organization createOrganization() {
    Organization organization = new Organization();
    organization.setName(ORGANIZATION_FIXTURE_NAME);
    organization.setDescription("Filigran test organization");
    return organization;
  }
}
