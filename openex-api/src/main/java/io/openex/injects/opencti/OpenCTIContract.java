package io.openex.injects.opencti;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.ContractVariable;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractElement;
import io.openex.contract.fields.ContractExpectations;
import io.openex.database.model.Variable.VariableType;
import io.openex.injects.opencti.config.OpenCTIConfig;
import io.openex.injects.ovh_sms.config.OvhSmsConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static io.openex.contract.Contract.executableContract;
import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractCardinality.One;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractVariable.variable;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractExpectations.expectationsField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;
import static io.openex.helper.SupportedLanguage.en;
import static io.openex.helper.SupportedLanguage.fr;

@Component
public class OpenCTIContract extends Contractor {

  public static final String TYPE = "openex_opencti";
  public static final String OPENCTI_CREATE_CASE = "88db2075-ae49-4fe9-a64c-08da2ed07637";

  public static final String OPENCTI_CREATE_REPORT = "b535f011-3a03-46e7-800a-74f01cd8865e";

  private OpenCTIConfig config;

  @Autowired
  public void setConfig(OpenCTIConfig config) {
    this.config = config;
  }

  @Override
  public boolean isExpose() {
    return Optional.ofNullable(config.getEnable()).orElse(false);
  }

  @Override
  public String getType() {
    return TYPE;
  }

  @Override
  public ContractConfig getConfig() {
    return new ContractConfig(TYPE, Map.of(en, "OpenCTI", fr, "OpenCTI"), "#cddc39", "/img/email.png", isExpose());
  }
  
  @Override
  public List<Contract> contracts() {
    // variables
    ContractVariable documentUriVariable = variable("document_uri",
        "Http user link to upload the document (only for document expectation)", VariableType.String, One);
    // Contracts
    ContractExpectations expectationsField = expectationsField(
        "expectations", "Expectations"
    );
    ContractConfig contractConfig = getConfig();
    List<ContractElement> createCaseInstance = contractBuilder()
        .mandatory(textField("name", "Name"))
        .mandatory(richTextareaField("description", "Description"))
        .optional(attachmentField("attachments", "Attachments", Multiple))
        .optional(expectationsField)
        .build();
    Contract createCase = executableContract(contractConfig, OPENCTI_CREATE_CASE,
        Map.of(en, "Create a new case", fr, "Créer un nouveau case"), createCaseInstance);
    createCase.addVariable(documentUriVariable);
    List<ContractElement> createReportInstance = contractBuilder()
        .mandatory(textField("name", "Name"))
        .mandatory(richTextareaField("description", "Description"))
        .optional(attachmentField("attachments", "Attachments", Multiple))
        .optional(expectationsField)
        .build();
    Contract createReport = executableContract(contractConfig, OPENCTI_CREATE_REPORT,
        Map.of(en, "Create a new report", fr, "Créer un nouveau rapport"), createReportInstance);
    createReport.addVariable(documentUriVariable);
    return List.of(createCase, createReport);
  }
}
