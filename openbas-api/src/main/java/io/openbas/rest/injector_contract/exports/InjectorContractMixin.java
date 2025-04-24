package io.openbas.rest.injector_contract.exports;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.AttackPattern;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class InjectorContractMixin {

  @JsonSerialize(using = JsonSerializer.None.class)
  public abstract List<AttackPattern> getAttackPatterns();
}
