package io.openbas.rest.inject.exports;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.AttackPattern;
import java.util.List;

@JsonIgnoreProperties(
    value = {"listened"},
    ignoreUnknown = true)
public abstract class PayloadMixin {

  @JsonSerialize(using = JsonSerializer.None.class)
  public abstract List<AttackPattern> getAttackPatterns();
}
