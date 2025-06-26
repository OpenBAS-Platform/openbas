package io.openbas.engine.model.vulnerableendpoint;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.database.model.Endpoint;
import io.openbas.engine.model.EsBase;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "vulnerable endpoint", label = "Vulnerable Endpoint")
public class EsVulnerableEndpoint extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */
  /* Except relationships, they should have same name on every model! */

  // -- ASSET GENERIC
  @Queryable(label = "vulnerable endpoint hostname", filterable = true)
  @EsQueryable(keyword = true)
  private String vulnerable_endpoint_hostname;

  @Queryable(
      label = "vulnerable endpoint platform",
      filterable = true,
      dynamicValues = true,
      refEnumClazz = Endpoint.PLATFORM_TYPE.class)
  @EsQueryable(keyword = true)
  private String vulnerable_endpoint_platform;

  @Queryable(
      label = "vulnerable endpoint architecture",
      filterable = true,
      dynamicValues = true,
      refEnumClazz = Endpoint.PLATFORM_ARCH.class)
  @EsQueryable(keyword = true)
  private String vulnerable_endpoint_architecture;

  // -- SIDE --

  @Queryable(label = "simulation", filterable = true)
  @EsQueryable(keyword = true)
  private String base_simulation_side; // Must finish by _side

  @Queryable(label = "agents", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_agents_side; // Must finish by _side

  @Queryable(label = "findings", filterable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_findings_side; // Must finish by _side

  @Queryable(label = "tags", filterable = true, dynamicValues = true)
  @EsQueryable(keyword = true)
  private Set<String> base_tags_side; // Must finish by _side
}
