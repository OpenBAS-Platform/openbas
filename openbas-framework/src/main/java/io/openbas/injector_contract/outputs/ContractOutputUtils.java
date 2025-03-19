package io.openbas.injectorContract.outputs;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Finding;
import java.util.List;
import java.util.stream.StreamSupport;
import org.jetbrains.annotations.NotNull;

public class ContractOutputUtils {

  public static final String OUTPUTS = "outputs";

  private ContractOutputUtils() {}

  public static List<ContractOutputElement> getContractOutputs(
      @NotNull final ObjectNode content, ObjectMapper mapper) {
    return StreamSupport.stream(content.get(OUTPUTS).spliterator(), false)
        .map(
            jsonNode -> {
              try {
                return mapper.treeToValue(jsonNode, ContractOutputElement.class);
              } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
              }
            })
        .toList();
  }

  public static Finding createFinding(@NotNull final ContractOutputElement element) {
    Finding finding = new Finding();
    finding.setType(element.getType());
    finding.setField(element.getField());
    finding.setLabels(element.getLabels());
    return finding;
  }
}
