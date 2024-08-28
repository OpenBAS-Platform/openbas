package io.openbas.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.helper.ObjectMapperHelper;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.mapper.export.MapperExportMixins;
import io.openbas.rest.mapper.form.*;
import io.openbas.utils.CopyObjectListUtils;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static io.openbas.utils.StringUtils.duplicateString;
import static java.util.stream.StreamSupport.stream;

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
            injectImporter.getRuleAttributes().add(CopyObjectListUtils.copyObjectWithoutId(ruleAttributeInput, RuleAttribute.class));
        });
        importMapper.getInjectImporters().add(injectImporter);
      }
    );

    return importMapper;
  }

  /**
   * Duplicate importMapper by id
   * @param importMapperId id of the mapper that need to be duplicated
   * @return The duplicated ImportMapper
   */
  @Transactional
  public ImportMapper getDuplicateImportMapper(@NotBlank String importMapperId) {
    if (StringUtils.isNotBlank(importMapperId)) {
      ImportMapper importMapperOrigin = importMapperRepository.findById(UUID.fromString(importMapperId)).orElseThrow();
      ImportMapper importMapper = CopyObjectListUtils.copyObjectWithoutId(importMapperOrigin, ImportMapper.class);
      importMapper.setName(duplicateString(importMapperOrigin.getName()));
      List<InjectImporter> injectImporters = getInjectImportersDuplicated(importMapperOrigin.getInjectImporters());
      importMapper.setInjectImporters(injectImporters);
      return importMapperRepository.save(importMapper);
    }
    throw new ElementNotFoundException();
  }

  private List<InjectImporter> getInjectImportersDuplicated(List<InjectImporter> injectImportersOrigin) {
    List<InjectImporter> injectImporters = CopyObjectListUtils.copyWithoutIds(injectImportersOrigin, InjectImporter.class);
    injectImporters.forEach(injectImport -> {
      List<RuleAttribute> ruleAttributes = CopyObjectListUtils.copyWithoutIds(injectImport.getRuleAttributes(), RuleAttribute.class);
      injectImport.setRuleAttributes(ruleAttributes);
    });
    return injectImporters;
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
    return stream(injectorContractRepository.findAllById(ids).spliterator(), false)
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

  public String exportMappers(@NotNull final List<String> idsToExport) throws JsonProcessingException {
    ObjectMapper objectMapper = ObjectMapperHelper.openBASJsonMapper();
    List<ImportMapper> mappersList = StreamSupport.stream(
        importMapperRepository.findAllById(idsToExport.stream().map(UUID::fromString).toList()).spliterator(), false
    ).toList();

    objectMapper.addMixIn(ImportMapper.class, MapperExportMixins.ImportMapper.class);
    objectMapper.addMixIn(InjectImporter.class, MapperExportMixins.InjectImporter.class);
    objectMapper.addMixIn(RuleAttribute.class, MapperExportMixins.RuleAttribute.class);

    return objectMapper.writeValueAsString(mappersList);
  }

  public void importMappers(List<ImportMapperAddInput> mappers) {
    importMapperRepository.saveAll(
        mappers.stream()
            .map(this::createImportMapper)
            .peek((m) -> m.setName(m.getName() + " (Import)"))
            .toList()
    );
  }
}
