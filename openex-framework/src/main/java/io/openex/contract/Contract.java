package io.openex.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.contract.fields.ContractElement;
import io.openex.contract.variables.VariableHelper;
import io.openex.helper.SupportedLanguage;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
public class Contract {

    private final ContractConfig config;

    @Setter
    @JsonProperty("contract_id")
    private String id;

    @Setter
    private Map<SupportedLanguage, String> label;

    private final boolean manual;

    @Setter
    private List<ContractElement> fields;

    private final List<ContractVariable> variables = new ArrayList<>();

    private final Map<String, String> context = new HashMap<>();

    private Contract(ContractConfig config, String id, Map<SupportedLanguage, String> label, boolean manual, List<ContractElement> fields) {
        this.config = config;
        this.id = id;
        this.label = label;
        this.manual = manual;
        this.fields = fields;

        // Default variables linked to ExecutionContext
        // User variables
        this.variables.add(VariableHelper.userVariable);
        // Exercise variables
        this.variables.add(VariableHelper.exerciceVariable);
        // Audiences
        this.variables.add(VariableHelper.audienceVariable);
        // Direct uris
        this.variables.addAll(VariableHelper.uriVariables);
    }

    public static Contract manualContract(ContractConfig config, String id, Map<SupportedLanguage, String> label, List<ContractElement> fields) {
        return new Contract(config, id, label, true, fields);
    }

    public static Contract executableContract(ContractConfig config, String id, Map<SupportedLanguage, String> label, List<ContractElement> fields) {
        return new Contract(config, id, label, false, fields);
    }

    public void addContext(String key, String value) {
        this.context.put(key, value);
    }

    public void addVariable(ContractVariable variable) {
        variables.add(0, variable);
    }
}
