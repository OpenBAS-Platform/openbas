package io.openbas.injector_contract.fields;

import io.openbas.injector_contract.ContractType;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
public class ContractTextArea extends ContractElement {

  @Setter private String defaultValue = "";
  private final boolean richText;

  public ContractTextArea(String key, String label, boolean richText) {
    super(key, label);
    this.richText = richText;
  }

  public static ContractTextArea textareaField(String key, String label) {
    return new ContractTextArea(key, label, false);
  }

  public static ContractTextArea richTextareaField(String key, String label) {
    return new ContractTextArea(key, label, true);
  }

  public static ContractTextArea richTextareaField(String key, String label, String defaultValue) {
    ContractTextArea contractText = new ContractTextArea(key, label, true);
    contractText.setDefaultValue(defaultValue);
    return contractText;
  }

  public static ContractTextArea richTextareaField(
      String key, String label, String defaultValue, List<ContractElement> linkedFields) {
    ContractTextArea contractText = new ContractTextArea(key, label, true);
    contractText.setDefaultValue(defaultValue);
    contractText.setLinkedFields(linkedFields);
    return contractText;
  }

  @Override
  public ContractType getType() {
    return ContractType.Textarea;
  }
}
