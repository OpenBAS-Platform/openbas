package io.openbas.injector_contract.output;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.finding.Finding;
import io.openbas.database.model.finding.FindingUtils;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.StreamSupport;

import static io.openbas.database.model.finding.FindingType.ValueType.TEXT;

public class ContractOutputUtils {

  public static final String OUTPUTS = "outputs";

  public static final String OUTPUT_TYPE = "type";
  public static final String OUTPUT_FIELD = "field";
  public static final String OUTPUT_LABELS = "labels";

  private ContractOutputUtils() {
  }

  public static List<JsonNode> getContractOutputs(@NotNull final ObjectNode content) {
    return StreamSupport.stream(content.get(OUTPUTS).spliterator(), false).toList();
  }

  public static Finding toFinding(
      @NotNull final JsonNode output,
      @NotNull final ObjectNode values) {
    Finding finding = null;
    String type = output.get(OUTPUT_TYPE).asText();
    String field = output.get(OUTPUT_FIELD).asText();
    if (type.equals(TEXT.getValue())) {
      String value = values.get(field).asText();
      finding = FindingUtils.createFindingText(field, value);
      finding.setLabels(computeLabels(output));
    }
    // FIXME: add IPV6, CREDENTIALS, ect
    return finding;
  }

  public static String[] computeLabels(@NotNull final JsonNode output) {
    JsonNode labelsNode = output.get(OUTPUT_LABELS);
    List<String> labels = new ArrayList<>();
    if (labelsNode != null && labelsNode.isArray()) {
      for (JsonNode label : labelsNode) {
        labels.add(label.asText());
      }
    }
    return labels.toArray(String[]::new);
  }

}
