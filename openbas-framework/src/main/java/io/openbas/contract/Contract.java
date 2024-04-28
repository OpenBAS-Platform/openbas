package io.openbas.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.contract.fields.ContractElement;
import io.openbas.contract.variables.VariableHelper;
import io.openbas.database.model.Endpoint;
import io.openbas.helper.SupportedLanguage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
public class Contract {

    @NotNull
    private final ContractConfig config;

    @NotBlank
    @Setter
    @JsonProperty("contract_id")
    private String id;

    @NotEmpty
    @Setter
    private Map<SupportedLanguage, String> label;

    @NotNull
    private final boolean manual;

    @NotEmpty
    @Setter
    private List<ContractElement> fields;

    @NotEmpty
    private final List<ContractVariable> variables = new ArrayList<>();

    @NotNull
    private final Map<String, String> context = new HashMap<>();

    @NotEmpty
    @Setter
    @JsonProperty("contract_attack_patterns_external_ids")
    private List<String> attackPatternsExternalIds = new ArrayList<>();

    @Setter
    @JsonProperty("is_atomic_testing")
    private boolean isAtomicTesting = true;

    @Setter
    @JsonProperty("platforms")
    private List<String> platforms = new ArrayList<>();

    private Contract(
        @NotNull final ContractConfig config,
        @NotBlank final String id,
        @NotEmpty final Map<SupportedLanguage, String> label,
        final boolean manual,
        @NotEmpty final List<ContractElement> fields,
        final List<String> platforms
    ) {
        this.config = config;
        this.id = id;
        this.label = label;
        this.manual = manual;
        this.fields = fields;
        this.platforms = platforms;

        // Default variables linked to ExecutionContext
        // User variables
        this.variables.add(VariableHelper.userVariable);
        // Exercise variables
        this.variables.add(VariableHelper.exerciceVariable);
        // Teams
        this.variables.add(VariableHelper.teamVariable);
        // Direct uris
        this.variables.addAll(VariableHelper.uriVariables);
    }

    public static Contract manualContract(
        @NotNull final ContractConfig config,
        @NotBlank final String id,
        @NotEmpty final Map<SupportedLanguage, String> label,
        @NotEmpty final List<ContractElement> fields,
        final List<String> platforms) {
        Contract contract = new Contract(config, id, label, true, fields, platforms == null ? List.of(Endpoint.PLATFORM_TYPE.Generic.name()) : platforms);
        contract.setAtomicTesting(false);
        return contract;
    }

    public static Contract executableContract(
        @NotNull final ContractConfig config,
        @NotBlank final String id,
        @NotEmpty final Map<SupportedLanguage, String> label,
        @NotEmpty final List<ContractElement> fields,
        final List<String> platforms
        ) {
        return new Contract(config, id, label, false, fields, platforms == null ? List.of(Endpoint.PLATFORM_TYPE.Generic.name()) : platforms);
    }

    public void addContext(String key, String value) {
        this.context.put(key, value);
    }

    public void addVariable(ContractVariable variable) {
        variables.add(0, variable);
    }

    public void addAttackPattern(String id) {
        attackPatternsExternalIds.add(id);
    }
}
