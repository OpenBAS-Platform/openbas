package io.openbas.injectors.opencti;

import io.openbas.injector_contract.*;
import io.openbas.injector_contract.fields.ContractElement;
import io.openbas.injector_contract.fields.ContractExpectations;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Variable.VariableType;
import io.openbas.injectors.opencti.config.OpenCTIConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static io.openbas.injector_contract.Contract.executableContract;
import static io.openbas.injector_contract.ContractCardinality.Multiple;
import static io.openbas.injector_contract.ContractCardinality.One;
import static io.openbas.injector_contract.ContractDef.contractBuilder;
import static io.openbas.injector_contract.ContractVariable.variable;
import static io.openbas.injector_contract.fields.ContractAttachment.attachmentField;
import static io.openbas.injector_contract.fields.ContractExpectations.expectationsField;
import static io.openbas.injector_contract.fields.ContractText.textField;
import static io.openbas.injector_contract.fields.ContractTextArea.richTextareaField;
import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;

@Component
public class OpenCTIContract extends Contractor {

  public static final String TYPE = "openbas_opencti";
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
    return new ContractConfig(TYPE, Map.of(en, "OpenCTI", fr, "OpenCTI"), "#0fbcff", "#001bda", "/img/icon-opencti.png", isExpose());
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
        Map.of(en, "Create a new case", fr, "Créer un nouveau case"), createCaseInstance, List.of(Endpoint.PLATFORM_TYPE.Service), false);
    createCase.addVariable(documentUriVariable);
    List<ContractElement> createReportInstance = contractBuilder()
        .mandatory(textField("name", "Name"))
        .mandatory(richTextareaField("description", "Description"))
        .optional(attachmentField("attachments", "Attachments", Multiple))
        .optional(expectationsField)
        .build();
    Contract createReport = executableContract(contractConfig, OPENCTI_CREATE_REPORT,
        Map.of(en, "Create a new report", fr, "Créer un nouveau rapport"), createReportInstance, List.of(Endpoint.PLATFORM_TYPE.Service), false);
    createReport.addVariable(documentUriVariable);
    return List.of(createCase, createReport);
  }

  public ContractorIcon getIcon() {
    InputStream iconStream = getClass().getResourceAsStream("/img/icon-opencti.png");
    return new ContractorIcon(iconStream);
  }
}
