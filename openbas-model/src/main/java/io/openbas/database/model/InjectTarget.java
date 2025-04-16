package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import io.swagger.v3.oas.annotations.media.DiscriminatorMapping;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Set;
import lombok.Data;

@Data
@Schema(
    discriminatorProperty = "target_type",
    oneOf = {
      AssetGroupTarget.class,
    },
    discriminatorMapping = {
      @DiscriminatorMapping(value = "ASSETS_GROUPS", schema = AssetGroupTarget.class),
    })
public class InjectTarget {
  @JsonProperty("target_id")
  private String id;

  @JsonProperty("target_name")
  private String name;

  @JsonProperty("target_tags")
  @Queryable(filterable = true, searchable = true, sortable = true)
  private Set<String> tags;

  @JsonProperty("target_type")
  private String targetType;
}
