package io.openbas.database.specification;

import io.openbas.database.model.Organization;
import jakarta.annotation.Nullable;
import org.springframework.data.jpa.domain.Specification;

public class OrganizationSpecification {

  private OrganizationSpecification() {

  }

  public static Specification<Organization> byName(@Nullable final String searchText) {
    return UtilsSpecification.byName(searchText, "name");
  }

}
