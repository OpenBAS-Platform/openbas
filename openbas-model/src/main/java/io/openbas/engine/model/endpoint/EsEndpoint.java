package io.openbas.engine.model.endpoint;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Indexable(index = "endpoint", label = "Endpoint")
public class EsEndpoint extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */
  /* Except relationships, they should have same name on every model! */

  @Queryable(label = "endpoint ips", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> endpoint_ips;

  @Queryable(label = "endpoint hostname", filterable = true)
  @EsQueryable(keyword = true)
  private String endpoint_hostname;

  @Queryable(label = "endpoint platform", filterable = true)
  @EsQueryable(keyword = true)
  private String endpoint_platform;

  @Queryable(label = "endpoint arch", filterable = true)
  @EsQueryable(keyword = true)
  private String endpoint_arch;

  @Queryable(label = "endpoint mac addresses", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> endpoint_mac_addresses;

  // -- SIDE --

  @Queryable(label = "findings", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_findings_side; // Must finish by _side
}
