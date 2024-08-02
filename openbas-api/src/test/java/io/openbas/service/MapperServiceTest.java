package io.openbas.service;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.InjectImporter;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.mapper.form.*;
import io.openbas.utils.mockMapper.MockMapperUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
public class MapperServiceTest {
  @Mock
  private ImportMapperRepository importMapperRepository;

  @Mock
  private InjectorContractRepository injectorContractRepository;

  private MapperService mapperService;



  @BeforeEach
  void before() {
    // Injecting mocks into the controller
    mapperService = new MapperService(importMapperRepository, injectorContractRepository);
  }

  // -- SCENARIOS --

  @DisplayName("Test create a mapper")
  @Test
  void createMapper() throws Exception {
    // -- PREPARE --
    ImportMapper importMapper = MockMapperUtils.createImportMapper();
    ImportMapperAddInput importMapperInput = new ImportMapperAddInput();
    importMapperInput.setName(importMapper.getName());
    importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
    importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
      injectImporter -> {
        InjectImporterAddInput injectImporterAddInput = new InjectImporterAddInput();
        injectImporterAddInput.setInjectTypeValue(injectImporter.getImportTypeValue());
        injectImporterAddInput.setInjectorContractId(injectImporter.getInjectorContract().getId());

        injectImporterAddInput.setRuleAttributes(injectImporter.getRuleAttributes().stream().map(
          ruleAttribute -> {
            RuleAttributeAddInput ruleAttributeAddInput = new RuleAttributeAddInput();
            ruleAttributeAddInput.setName(ruleAttribute.getName());
            ruleAttributeAddInput.setColumns(ruleAttribute.getColumns());
            ruleAttributeAddInput.setDefaultValue(ruleAttribute.getDefaultValue());
            ruleAttributeAddInput.setAdditionalConfig(ruleAttribute.getAdditionalConfig());
            return ruleAttributeAddInput;
          }
        ).toList());
        return injectImporterAddInput;
      }
    ).toList());
    when(importMapperRepository.save(any())).thenReturn(importMapper);
    // -- EXECUTE --
    ImportMapper importMapperResponse = mapperService.createAndSaveImportMapper(importMapperInput);

    // -- ASSERT --
    assertNotNull(importMapperResponse);
    assertEquals(importMapperResponse.getId(), importMapper.getId());
  }

  @DisplayName("Test update a specific mapper by using new rule attributes and new inject importer")
  @Test
  void updateSpecificMapperWithNewElements() throws Exception {
    // -- PREPARE --
    ImportMapper importMapper = MockMapperUtils.createImportMapper();
    ImportMapperUpdateInput importMapperInput = new ImportMapperUpdateInput();
    importMapperInput.setName(importMapper.getName());
    importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
    importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
      injectImporter -> {
        InjectImporterUpdateInput injectImporterUpdateInput = new InjectImporterUpdateInput();
        injectImporterUpdateInput.setInjectTypeValue(injectImporter.getImportTypeValue());
        injectImporterUpdateInput.setInjectorContractId(injectImporter.getInjectorContract().getId());

        injectImporterUpdateInput.setRuleAttributes(injectImporter.getRuleAttributes().stream().map(
          ruleAttribute -> {
            RuleAttributeUpdateInput ruleAttributeUpdateInput = new RuleAttributeUpdateInput();
            ruleAttributeUpdateInput.setName(ruleAttribute.getName());
            ruleAttributeUpdateInput.setColumns(ruleAttribute.getColumns());
            ruleAttributeUpdateInput.setDefaultValue(ruleAttribute.getDefaultValue());
            ruleAttributeUpdateInput.setAdditionalConfig(ruleAttribute.getAdditionalConfig());
            return ruleAttributeUpdateInput;
          }
        ).toList());
        return injectImporterUpdateInput;
      }
    ).toList());
    when(importMapperRepository.findById(any())).thenReturn(Optional.of(importMapper));
    when(importMapperRepository.save(any())).thenReturn(importMapper);
    when(injectorContractRepository.findAllById(any())).thenReturn(importMapper.getInjectImporters().stream().map(InjectImporter::getInjectorContract).toList());

    // -- EXECUTE --
    ImportMapper response = mapperService.updateImportMapper(importMapper.getId(), importMapperInput);

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(response.getId(), importMapper.getId());
  }

    @DisplayName("Test update a specific mapper by creating rule attributes and updating new inject importer")
    @Test
    void updateSpecificMapperWithUpdatedInjectImporter() throws Exception {
        // -- PREPARE --
        ImportMapper importMapper = MockMapperUtils.createImportMapper();
        ImportMapperUpdateInput importMapperInput = new ImportMapperUpdateInput();
        importMapperInput.setName(importMapper.getName());
        importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
        importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
                injectImporter -> {
                    InjectImporterUpdateInput injectImporterUpdateInput = new InjectImporterUpdateInput();
                    injectImporterUpdateInput.setInjectTypeValue(injectImporter.getImportTypeValue());
                    injectImporterUpdateInput.setInjectorContractId(injectImporter.getInjectorContract().getId());
                    injectImporterUpdateInput.setId(injectImporter.getId());

                    injectImporterUpdateInput.setRuleAttributes(injectImporter.getRuleAttributes().stream().map(
                            ruleAttribute -> {
                                RuleAttributeUpdateInput ruleAttributeUpdateInput = new RuleAttributeUpdateInput();
                                ruleAttributeUpdateInput.setName(ruleAttribute.getName());
                                ruleAttributeUpdateInput.setColumns(ruleAttribute.getColumns());
                                ruleAttributeUpdateInput.setDefaultValue(ruleAttribute.getDefaultValue());
                                ruleAttributeUpdateInput.setAdditionalConfig(ruleAttribute.getAdditionalConfig());
                                return ruleAttributeUpdateInput;
                            }
                    ).toList());
                    return injectImporterUpdateInput;
                }
        ).toList());
        when(importMapperRepository.findById(any())).thenReturn(Optional.of(importMapper));
        when(importMapperRepository.save(any())).thenReturn(importMapper);
        when(injectorContractRepository.findAllById(any())).thenReturn(importMapper.getInjectImporters().stream().map(InjectImporter::getInjectorContract).toList());

        // -- EXECUTE --
        ImportMapper response = mapperService.updateImportMapper(importMapper.getId(), importMapperInput);

        // -- ASSERT --
        assertNotNull(response);
        assertEquals(response.getId(), importMapper.getId());
    }

    @DisplayName("Test update a specific mapper by updating rule attributes and updating inject importer")
    @Test
    void updateSpecificMapperWithUpdatedElements() throws Exception {
        // -- PREPARE --
        ImportMapper importMapper = MockMapperUtils.createImportMapper();
        ImportMapperUpdateInput importMapperInput = new ImportMapperUpdateInput();
        importMapperInput.setName(importMapper.getName());
        importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
        importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
                injectImporter -> {
                    InjectImporterUpdateInput injectImporterUpdateInput = new InjectImporterUpdateInput();
                    injectImporterUpdateInput.setInjectTypeValue(injectImporter.getImportTypeValue());
                    injectImporterUpdateInput.setInjectorContractId(injectImporter.getInjectorContract().getId());
                    injectImporterUpdateInput.setId(injectImporter.getId());

                    injectImporterUpdateInput.setRuleAttributes(injectImporter.getRuleAttributes().stream().map(
                            ruleAttribute -> {
                                RuleAttributeUpdateInput ruleAttributeUpdateInput = new RuleAttributeUpdateInput();
                                ruleAttributeUpdateInput.setName(ruleAttribute.getName());
                                ruleAttributeUpdateInput.setColumns(ruleAttribute.getColumns());
                                ruleAttributeUpdateInput.setDefaultValue(ruleAttribute.getDefaultValue());
                                ruleAttributeUpdateInput.setAdditionalConfig(ruleAttribute.getAdditionalConfig());
                                ruleAttributeUpdateInput.setId(ruleAttribute.getId());
                                return ruleAttributeUpdateInput;
                            }
                    ).toList());
                    return injectImporterUpdateInput;
                }
        ).toList());
        when(importMapperRepository.findById(any())).thenReturn(Optional.of(importMapper));
        when(importMapperRepository.save(any())).thenReturn(importMapper);
        when(injectorContractRepository.findAllById(any())).thenReturn(importMapper.getInjectImporters().stream().map(InjectImporter::getInjectorContract).toList());

        // -- EXECUTE --
        ImportMapper response = mapperService.updateImportMapper(importMapper.getId(), importMapperInput);

        // -- ASSERT --
        assertNotNull(response);
        assertEquals(response.getId(), importMapper.getId());
    }

}
