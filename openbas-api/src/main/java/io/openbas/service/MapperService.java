package io.openbas.service;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.InjectImporter;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.RuleAttribute;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.mapper.form.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

@RequiredArgsConstructor
@Service
public class MapperService {

  private final ImportMapperRepository importMapperRepository;

  private final InjectorContractRepository injectorContractRepository;

  /**
   * Create and save an ImportMapper object from a MapperAddInput one
   * @param importMapperAddInput The input from the call
   * @return The created ImportMapper
   */
  public ImportMapper createAndSaveImportMapper(ImportMapperAddInput importMapperAddInput) {
    ImportMapper importMapper = createImportMapper(importMapperAddInput);

    return importMapperRepository.save(importMapper);
  }

  public ImportMapper createImportMapper(ImportMapperAddInput importMapperAddInput) {
    ImportMapper importMapper = new ImportMapper();
    importMapper.setUpdateAttributes(importMapperAddInput);
    importMapper.setInjectImporters(new ArrayList<>());

    Map<String, InjectorContract> mapInjectorContracts = getMapOfInjectorContracts(
            importMapperAddInput.getImporters()
                    .stream()
                    .map(InjectImporterAddInput::getInjectorContractId)
                    .toList()
    );

    importMapperAddInput.getImporters().forEach(
            injectImporterInput -> {
              InjectImporter injectImporter = new InjectImporter();
              injectImporter.setInjectorContract(mapInjectorContracts.get(injectImporterInput.getInjectorContractId()));
              injectImporter.setImportTypeValue(injectImporterInput.getInjectTypeValue());
              injectImporter.setRuleAttributes(new ArrayList<>());
              injectImporterInput.getRuleAttributes().forEach(ruleAttributeInput -> {
                RuleAttribute ruleAttribute = new RuleAttribute();
                ruleAttribute.setColumns(ruleAttributeInput.getColumns());
                ruleAttribute.setName(ruleAttributeInput.getName());
                ruleAttribute.setDefaultValue(ruleAttributeInput.getDefaultValue());
                ruleAttribute.setAdditionalConfig(ruleAttributeInput.getAdditionalConfig());
                injectImporter.getRuleAttributes().add(ruleAttribute);
              });
              importMapper.getInjectImporters().add(injectImporter);
            }
    );

    return importMapper;
  }

  /**
   * Update an ImportMapper object from a MapperUpdateInput one
   * @param mapperId the id of the mapper that needs to be updated
   * @param importMapperUpdateInput The input from the call
   * @return The updated ImportMapper
   */
  public ImportMapper updateImportMapper(String mapperId, ImportMapperUpdateInput importMapperUpdateInput) {
    ImportMapper importMapper = importMapperRepository.findById(UUID.fromString(mapperId)).orElseThrow(ElementNotFoundException::new);
    importMapper.setUpdateAttributes(importMapperUpdateInput);
    importMapper.setUpdateDate(Instant.now());

    Map<String, InjectorContract> mapInjectorContracts = getMapOfInjectorContracts(
            importMapperUpdateInput.getImporters()
                    .stream()
                    .map(InjectImporterUpdateInput::getInjectorContractId)
                    .toList()
    );

    updateInjectImporter(importMapperUpdateInput.getImporters(), importMapper.getInjectImporters(), mapInjectorContracts);

    return importMapperRepository.save(importMapper);
  }

  /**
   * Gets a map of injector contracts by ids
   * @param ids The ids of the injector contracts we want
   * @return The map of injector contracts by ids
   */
  private Map<String, InjectorContract> getMapOfInjectorContracts(List<String> ids) {
    return StreamSupport.stream(injectorContractRepository.findAllById(ids).spliterator(), false)
            .collect(Collectors.toMap(InjectorContract::getId, Function.identity()));
  }

  /**
   * Updates rule attributes from a list of input
   * @param ruleAttributesInput the list of rule attributes input
   * @param ruleAttributes the list of rule attributes to update
   */
  private void updateRuleAttributes(List<RuleAttributeUpdateInput> ruleAttributesInput, List<RuleAttribute> ruleAttributes) {
    // First, we remove the entities that are no longer linked to the mapper
    ruleAttributes.removeIf(ruleAttribute -> ruleAttributesInput.stream().noneMatch(importerInput -> ruleAttribute.getId().equals(importerInput.getId())));

    // Then we update the existing ones
    ruleAttributes.forEach(ruleAttribute -> {
      RuleAttributeUpdateInput ruleAttributeInput = ruleAttributesInput.stream()
              .filter(ruleAttributeUpdateInput -> ruleAttribute.getId().equals(ruleAttributeUpdateInput.getId()))
              .findFirst()
              .orElseThrow(ElementNotFoundException::new);
      ruleAttribute.setUpdateAttributes(ruleAttributeInput);
    });

    // Then we add the new ones
    ruleAttributesInput.forEach(ruleAttributeUpdateInput -> {
      if (ruleAttributeUpdateInput.getId() == null || ruleAttributeUpdateInput.getId().isBlank()) {
        RuleAttribute ruleAttribute = new RuleAttribute();
        ruleAttribute.setColumns(ruleAttributeUpdateInput.getColumns());
        ruleAttribute.setName(ruleAttributeUpdateInput.getName());
        ruleAttribute.setDefaultValue(ruleAttributeUpdateInput.getDefaultValue());
        ruleAttribute.setAdditionalConfig(ruleAttributeUpdateInput.getAdditionalConfig());
        ruleAttributes.add(ruleAttribute);
      }
    });
  }

  /**
   * Updates a list of inject importers from an input one
   * @param injectImportersInput the input
   * @param injectImporters the inject importers to update
   * @param mapInjectorContracts a map of injector contracts by contract id
   */
  private void updateInjectImporter(List<InjectImporterUpdateInput> injectImportersInput, List<InjectImporter> injectImporters, Map<String, InjectorContract> mapInjectorContracts) {
    // First, we remove the entities that are no longer linked to the mapper
    injectImporters.removeIf(importer -> !injectImportersInput.stream().anyMatch(importerInput -> importer.getId().equals(importerInput.getId())));

    // Then we update the existing ones
    injectImporters.forEach(injectImporter -> {
      InjectImporterUpdateInput injectImporterInput = injectImportersInput.stream()
              .filter(injectImporterUpdateInput -> injectImporter.getId().equals(injectImporterUpdateInput.getId()))
              .findFirst()
              .orElseThrow(ElementNotFoundException::new);
      injectImporter.setUpdateAttributes(injectImporterInput);
      updateRuleAttributes(injectImporterInput.getRuleAttributes(), injectImporter.getRuleAttributes());
    });

    // Then we add the new ones
    injectImportersInput.forEach(injectImporterUpdateInput -> {
      if (injectImporterUpdateInput.getId() == null || injectImporterUpdateInput.getId().isBlank()) {
        InjectImporter injectImporter = new InjectImporter();
        injectImporter.setInjectorContract(mapInjectorContracts.get(injectImporterUpdateInput.getInjectorContractId()));
        injectImporter.setImportTypeValue(injectImporterUpdateInput.getInjectTypeValue());
        injectImporter.setRuleAttributes(new ArrayList<>());
        injectImporterUpdateInput.getRuleAttributes().forEach(ruleAttributeInput -> {
          RuleAttribute ruleAttribute = new RuleAttribute();
          ruleAttribute.setColumns(ruleAttributeInput.getColumns());
          ruleAttribute.setName(ruleAttributeInput.getName());
          ruleAttribute.setDefaultValue(ruleAttributeInput.getDefaultValue());
          ruleAttribute.setAdditionalConfig(ruleAttributeInput.getAdditionalConfig());
          injectImporter.getRuleAttributes().add(ruleAttribute);
        });
        injectImporters.add(injectImporter);
      }
    });
  }

  public List<ImportMapperAddInput> exportMappers(List<String> idsToExport) {
    List<ImportMapper> mappersList = StreamSupport.stream(importMapperRepository.findAllById(idsToExport.stream().map(UUID::fromString).toList()).spliterator(), false).toList();

    return mappersList.stream().map(importMapper -> {
      ImportMapperAddInput importMapperAddInput = new ImportMapperAddInput();
      importMapperAddInput.setName(importMapper.getName());
      importMapperAddInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
      importMapperAddInput.setImporters(importMapper.getInjectImporters().stream().map(
        injectImporter -> {
          InjectImporterAddInput injectImporterAddInput = new InjectImporterAddInput();
          injectImporterAddInput.setInjectTypeValue(injectImporter.getImportTypeValue());
          injectImporterAddInput.setInjectorContractId(injectImporter.getInjectorContract().getId());
          injectImporterAddInput.setRuleAttributes(injectImporter.getRuleAttributes().stream().map(ruleAttribute -> {
            RuleAttributeAddInput ruleAttributeAddInput = new RuleAttributeAddInput();
            ruleAttributeAddInput.setColumns(ruleAttribute.getColumns());
            ruleAttributeAddInput.setName(ruleAttribute.getName());
            ruleAttributeAddInput.setDefaultValue(ruleAttribute.getDefaultValue());
            ruleAttributeAddInput.setAdditionalConfig(ruleAttribute.getAdditionalConfig());
            return ruleAttributeAddInput;
          }).toList());
          return injectImporterAddInput;
        }
      ).toList());
      return importMapperAddInput;
    }).toList();
  }

  public void importMappers(List<ImportMapperAddInput> mappers) {
    importMapperRepository.saveAll(mappers.stream().map(this::createImportMapper).toList());
  }
}
