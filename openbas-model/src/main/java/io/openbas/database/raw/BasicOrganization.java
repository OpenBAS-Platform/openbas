package io.openbas.database.raw;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BasicOrganization {

  private String organization_id;
  private String organization_name;
  private String organization_description;

}
