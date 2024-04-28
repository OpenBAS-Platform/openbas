package io.openbas.injectors.caldera;

import io.openbas.contract.*;
import io.openbas.contract.fields.ContractAsset;
import io.openbas.contract.fields.ContractAssetGroup;
import io.openbas.contract.fields.ContractExpectations;
import io.openbas.contract.fields.ContractSelect;
import io.openbas.helper.SupportedLanguage;
import io.openbas.injectors.caldera.client.model.Ability;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.model.Obfuscator;
import io.openbas.injectors.caldera.service.CalderaInjectorService;
import io.openbas.model.inject.form.Expectation;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static io.openbas.contract.Contract.executableContract;
import static io.openbas.contract.ContractCardinality.Multiple;
import static io.openbas.contract.ContractDef.contractBuilder;
import static io.openbas.contract.fields.ContractAsset.assetField;
import static io.openbas.contract.fields.ContractAssetGroup.assetGroupField;
import static io.openbas.contract.fields.ContractExpectations.expectationsField;
import static io.openbas.contract.fields.ContractSelect.selectFieldWithDefault;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;
import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;

@Component
@RequiredArgsConstructor
public class CalderaContract extends Contractor {

  public static final String TYPE = "openbas_caldera";

  private final CalderaInjectorConfig config;
  private final CalderaInjectorService injectorCalderaService;

  @Override
  public boolean isExpose() {
    return this.config.isEnable();
  }

  @Override
  public String getType() {
    return TYPE;
  }

  @Override
  public ContractConfig getConfig() {
    Map<SupportedLanguage, String> labels = Map.of(en, "Caldera", fr, "Caldera");
    return new ContractConfig(TYPE, labels, "#8b0000", "#8b0000", "/img/icon-caldera.png", isExpose());
  }

  @Override
  public List<Contract> contracts() {
    if (this.config.isEnable()) {
      ContractConfig contractConfig = getConfig();
      // Add contract based on abilities
      return new ArrayList<>(abilityContracts(contractConfig));
    }
    return List.of();
  }

  // -- PRIVATE --

  private ContractSelect obfuscatorField() {
    List<Obfuscator> obfuscators = this.injectorCalderaService.obfuscators();
    Map<String, String> obfuscatorChoices = obfuscators.stream()
        .collect(Collectors.toMap(Obfuscator::getName, Obfuscator::getName));
    return selectFieldWithDefault(
        "obfuscator",
        "Obfuscators",
        obfuscatorChoices,
        obfuscatorChoices.keySet().stream().findFirst().orElse("")
    );
  }

  private ContractExpectations expectations() {
    // Prevention
    Expectation preventionExpectation = new Expectation();
    preventionExpectation.setType(PREVENTION);
    preventionExpectation.setName("Expect inject to be prevented");
    preventionExpectation.setScore(0);
    // Detection
    Expectation detectionExpectation = new Expectation();
    detectionExpectation.setType(DETECTION);
    detectionExpectation.setName("Expect inject to be detected");
    detectionExpectation.setScore(0);

    return expectationsField(
        "expectations", "Expectations", List.of(preventionExpectation, detectionExpectation)
    );
  }

  private List<Contract> abilityContracts(@NotNull final ContractConfig contractConfig) {
    // Fields
    ContractSelect obfuscatorField = obfuscatorField();
    ContractAsset assetField = assetField("assets", "Assets", Multiple);
    ContractAssetGroup assetGroupField = assetGroupField("assetgroups", "Asset groups",
        Multiple);
    // Expectations
    ContractExpectations expectationsField = expectations();

    List<Ability> abilities = this.injectorCalderaService.abilities();
    // Build contracts
    return abilities.stream().map((ability -> {
      ContractDef builder = contractBuilder();
      builder.mandatory(obfuscatorField);
      builder.mandatoryGroup(assetField, assetGroupField);
      builder.optional(expectationsField);
      Contract contract = executableContract(
          contractConfig,
          ability.getAbility_id(),
          Map.of(en, ability.getName(), fr, ability.getName()),
          builder.build()
      );
      contract.addContext("collector-ids", String.join(", ", this.config.getCollectorIds()));
      contract.addAttackPattern(ability.getTechnique_id());
      return contract;
    })).collect(Collectors.toList());
  }

  @Override
  public ContractorIcon getIcon() {
    InputStream iconStream = getClass().getResourceAsStream("/img/icon-caldera.png");
    return new ContractorIcon(iconStream);
  }
}
