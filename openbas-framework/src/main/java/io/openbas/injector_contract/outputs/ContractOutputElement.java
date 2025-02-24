package io.openbas.injector_contract.outputs;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.ContractOutputType;
import io.openbas.database.model.Finding;
import lombok.Getter;
import lombok.Setter;
import org.jetbrains.annotations.NotNull;

import java.util.List;

@Getter
@Setter
public abstract class ContractOutputElement {
  private String field;
  private String[] labels;
  boolean isMultiple;

  public ContractOutputElement(String field, String[] labels, boolean isMultiple) {
    this.field = field;
    this.labels = labels;
    this.isMultiple = isMultiple;
  }

  public abstract ContractOutputTechnicalType getTechnicalType();

  public abstract ContractOutputType getType();

  public abstract List<Finding> toFindings(@NotNull final ObjectNode values);
}
