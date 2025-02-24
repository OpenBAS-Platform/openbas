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
public class ContractOutputText extends ContractOutputElement {

  public ContractOutputText(String field, String[] labels, boolean isMultiple) {
    super(field, labels, isMultiple);
  }

  @Override
  public ContractOutputTechnicalType getTechnicalType() { return ContractOutputTechnicalType.Text; }

  @Override
  public ContractOutputType getType() {
    return ContractOutputType.Text;
  }

  @Override
  public List<Finding> toFindings(@NotNull final ObjectNode values) {
    List<String> texts = new ArrayList<>();
    if( isMultiple ) {
      JsonNode jsonPorts = values.get(this.getField());
      if( jsonPorts != null && jsonPorts.isArray() ) {
        for(JsonNode jsonPort : jsonPorts ) {
          texts.add(jsonPort.asText());
        }
      }
    } else {
      texts.add(values.get(this.getField()).asText());
    }
    return texts.stream().map(text -> {
      Finding finding = createFinding(this);
      finding.setValue(text);
      return finding;
    }).toList();
  }
}
