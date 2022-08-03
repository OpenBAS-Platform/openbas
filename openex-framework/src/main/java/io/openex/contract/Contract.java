package io.openex.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.contract.fields.ContractElement;
import io.openex.helper.SupportedLanguage;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractCardinality.One;
import static io.openex.contract.ContractVariable.variable;
import static io.openex.contract.VariableType.Object;
import static io.openex.contract.VariableType.String;
import static io.openex.execution.ExecutionContext.*;

public class Contract {

    private final ContractConfig config;

    @JsonProperty("contract_id")
    private String id;

    private Map<SupportedLanguage, String> label;

    private final boolean manual;

    private List<ContractElement> fields;

    private final List<ContractVariable> variables = new ArrayList<>();

    private final Map<String, String> context = new HashMap<>();

    private Contract(ContractConfig config, String id, Map<SupportedLanguage, String> label, boolean manual, List<ContractElement> fields) {
        this.config = config;
        this.id = id;
        this.label = label;
        this.manual = manual;
        this.fields = fields;
    }

    public static Contract manualContract(ContractConfig config, String id, Map<SupportedLanguage, String> label, List<ContractElement> fields) {
        return new Contract(config, id, label, true, fields);
    }

    public static Contract executableContract(ContractConfig config, String id, Map<SupportedLanguage, String> label, List<ContractElement> fields) {
        return new Contract(config, id, label, false, fields);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<ContractElement> getFields() {
        return fields;
    }

    public void setFields(List<ContractElement> fields) {
        this.fields = fields;
    }

    public Map<SupportedLanguage, String> getLabel() {
        return label;
    }

    public void setLabel(Map<SupportedLanguage, String> label) {
        this.label = label;
    }

    public boolean isManual() {
        return manual;
    }

    public Map<String, String> getContext() {
        return context;
    }

    public void addContext(String key, String value) {
        this.context.put(key, value);
    }

    public ContractConfig getConfig() {
        return config;
    }

    public void addVariable(ContractVariable variable) {
        variables.add(variable);
    }

    public List<ContractVariable> getVariables() {
        // Default variables linked to ExecutionContext
        // User variables
        variables.add(variable(USER, "User that will receive the injection", Object, One, List.of(
                variable(USER + ".id", "Id of the user in the platform", String, One),
                variable(USER + ".email", "Email of the user", String, One),
                variable(USER + ".firstname", "Firstname of the user", String, One),
                variable(USER + ".lastname", "Lastname of the user", String, One),
                variable(USER + ".lang", "Lang of the user", String, One)
        )));
        // Exercise variables
        variables.add(variable(EXERCISE, "Exercise of the current injection", Object, One, List.of(
                variable(EXERCISE + ".id", "Id of the user in the platform", String, One),
                variable(EXERCISE + ".name", "Name of the exercise", String, One),
                variable(EXERCISE + ".description", "Description of the exercise", String, One)
        )));
        // Audiences
        variables.add(variable(AUDIENCES, "List of audience name for the injection", String, Multiple));
        // Direct uris
        variables.add(variable(PLAYER_URI, "Player interface platform link", String, One));
        variables.add(variable(CHALLENGES_URI, "Player interface platform link", String, One));
        variables.add(variable(SCOREBOARD_URI, "Scoreboard interface platform link", String, One));
        return variables;
    }
}
