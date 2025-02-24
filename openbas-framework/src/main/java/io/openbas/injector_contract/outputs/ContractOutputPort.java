package io.openbas.injector_contract.outputs;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.ContractOutputType;
import io.openbas.database.model.Finding;
import lombok.Getter;
import lombok.Setter;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.injector_contract.outputs.ContractOutputUtils.createFinding;

@Setter
@Getter
public class ContractOutputPort extends ContractOutputElement {

  public ContractOutputPort(String field, String[] labels, boolean isMultiple) {
    super(field, labels, isMultiple);
  }

  @Override
  public ContractOutputTechnicalType getTechnicalType() { return ContractOutputTechnicalType.Number; }

  @Override
  public ContractOutputType getType() {
    return ContractOutputType.Port;
  }

  @Override
  public List<Finding> toFindings(@NotNull final ObjectNode values) {
    List<Integer> ports = new ArrayList<>();
    if( isMultiple ) {
      JsonNode jsonPorts = values.get(this.getField());
      if( jsonPorts != null && jsonPorts.isArray() ) {
        for(JsonNode jsonPort : jsonPorts ) {
          ports.add(jsonPort.asInt());
        }
      }
    } else {
      ports.add(values.get(this.getField()).asInt());
    }
    return ports.stream().map(port -> {
      Finding finding = createFinding(this);
      finding.setValue(port.toString());
      return finding;
    }).toList();
  }
}
