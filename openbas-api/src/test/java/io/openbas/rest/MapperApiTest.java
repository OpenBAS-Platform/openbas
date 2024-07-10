package io.openbas.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.ImportMapper;
import io.openbas.database.model.InjectImporter;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.RuleAttribute;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.mapper.MapperApi;
import io.openbas.rest.mapper.form.*;
import io.openbas.utils.fixtures.PaginationFixture;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.*;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
public class MapperApiTest {

  private MockMvc mvc;

  @Mock
  private ImportMapperRepository importMapperRepository;

  @Mock
  private InjectorContractRepository injectorContractRepository;

  @Autowired
  private ObjectMapper objectMapper;

  private MapperApi mapperApi;



  @BeforeEach
  void before() {
    // Injecting mocks into the controller
    mapperApi = new MapperApi(importMapperRepository, injectorContractRepository);

    mvc = MockMvcBuilders.standaloneSetup(mapperApi)
            .build();
  }

  // -- SCENARIOS --

  @DisplayName("Test search of mappers")
  @Test
  void searchMappers() throws Exception {
    // -- PREPARE --
    List<ImportMapper> importMappers = List.of(createImportMapper());
    Pageable pageable = PageRequest.of(0, 10);
    PageImpl page = new PageImpl<>(importMappers, pageable, importMappers.size());
    when(importMapperRepository.findAll(any(), any())).thenReturn(page);
    // -- EXECUTE --
    String response = this.mvc
      .perform(MockMvcRequestBuilders.post("/api/mappers/search")
              .contentType(MediaType.APPLICATION_JSON)
              .content(asJsonString(PaginationFixture.getDefault().textSearch("").build())))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(JsonPath.read(response, "$.content[0].import_mapper_id"), importMappers.get(0).getId());
  }

  @DisplayName("Test search of a specific mapper")
  @Test
  void searchSpecificMapper() throws Exception {
    // -- PREPARE --
    ImportMapper importMapper = createImportMapper();
    when(importMapperRepository.findById(any())).thenReturn(Optional.of(importMapper));
    // -- EXECUTE --
    String response = this.mvc
            .perform(MockMvcRequestBuilders.get("/api/mappers/" + importMapper.getId())
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(JsonPath.read(response, "$.import_mapper_id"), importMapper.getId());
  }

  @DisplayName("Test create a mapper")
  @Test
  void createMapper() throws Exception {
    // -- PREPARE --
    ImportMapper importMapper = createImportMapper();
    MapperAddInput importMapperInput = new MapperAddInput();
    importMapperInput.setName(importMapper.getName());
    importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
    importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
      injectImporter -> {
        InjectImporterAddInput injectImporterAddInput = new InjectImporterAddInput();
        injectImporterAddInput.setName(injectImporter.getName());
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
    String response = this.mvc
            .perform(MockMvcRequestBuilders.post("/api/mappers/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(importMapperInput)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(JsonPath.read(response, "$.import_mapper_id"), importMapper.getId());
  }

  @DisplayName("Test delete a specific mapper")
  @Test
  void deleteSpecificMapper() throws Exception {
    // -- PREPARE --
    ImportMapper importMapper = createImportMapper();
    // -- EXECUTE --
    this.mvc
            .perform(MockMvcRequestBuilders.delete("/api/mappers/" + importMapper.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(PaginationFixture.getDefault().textSearch("").build())))
            .andExpect(status().is2xxSuccessful());

    verify(importMapperRepository, times(1)).deleteById(any());
  }

  @DisplayName("Test update a specific mapper by using new rule attributes and new inject importer")
  @Test
  void updateSpecificMapperWithNewElements() throws Exception {
    // -- PREPARE --
    ImportMapper importMapper = createImportMapper();
    MapperUpdateInput importMapperInput = new MapperUpdateInput();
    importMapperInput.setName(importMapper.getName());
    importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
    importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
      injectImporter -> {
        InjectImporterUpdateInput injectImporterUpdateInput = new InjectImporterUpdateInput();
        injectImporterUpdateInput.setName(injectImporter.getName());
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
    String response = this.mvc
            .perform(MockMvcRequestBuilders.put("/api/mappers/" + importMapper.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(importMapperInput)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(JsonPath.read(response, "$.import_mapper_id"), importMapper.getId());
  }

    @DisplayName("Test update a specific mapper by creating rule attributes and updating new inject importer")
    @Test
    void updateSpecificMapperWithUpdatedInjectImporter() throws Exception {
        // -- PREPARE --
        ImportMapper importMapper = createImportMapper();
        MapperUpdateInput importMapperInput = new MapperUpdateInput();
        importMapperInput.setName(importMapper.getName());
        importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
        importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
                injectImporter -> {
                    InjectImporterUpdateInput injectImporterUpdateInput = new InjectImporterUpdateInput();
                    injectImporterUpdateInput.setName(injectImporter.getName());
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
        String response = this.mvc
                .perform(MockMvcRequestBuilders.put("/api/mappers/" + importMapper.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJsonString(importMapperInput)))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // -- ASSERT --
        assertNotNull(response);
        assertEquals(JsonPath.read(response, "$.import_mapper_id"), importMapper.getId());
    }

    @DisplayName("Test update a specific mapper by updating rule attributes and updating inject importer")
    @Test
    void updateSpecificMapperWithUpdatedElements() throws Exception {
        // -- PREPARE --
        ImportMapper importMapper = createImportMapper();
        MapperUpdateInput importMapperInput = new MapperUpdateInput();
        importMapperInput.setName(importMapper.getName());
        importMapperInput.setInjectTypeColumn(importMapper.getInjectTypeColumn());
        importMapperInput.setImporters(importMapper.getInjectImporters().stream().map(
                injectImporter -> {
                    InjectImporterUpdateInput injectImporterUpdateInput = new InjectImporterUpdateInput();
                    injectImporterUpdateInput.setName(injectImporter.getName());
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
        String response = this.mvc
                .perform(MockMvcRequestBuilders.put("/api/mappers/" + importMapper.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJsonString(importMapperInput)))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // -- ASSERT --
        assertNotNull(response);
        assertEquals(JsonPath.read(response, "$.import_mapper_id"), importMapper.getId());
    }

  private ImportMapper createImportMapper() {
    ImportMapper importMapper = new ImportMapper();
    importMapper.setId(UUID.randomUUID().toString());
    importMapper.setName("Test");
    importMapper.setUpdateDate(Instant.now());
    importMapper.setCreationDate(Instant.now());
    importMapper.setInjectTypeColumn("A");
    importMapper.setInjectImporters(new ArrayList<>());

    importMapper.getInjectImporters().add(createInjectImporter());

    return importMapper;
  }

  private InjectImporter createInjectImporter() {
      InjectImporter injectImporter = new InjectImporter();
      injectImporter.setId(UUID.randomUUID().toString());
      injectImporter.setName("Test");
      injectImporter.setImportTypeValue("Test");
      InjectorContract injectorContract = new InjectorContract();
      injectorContract.setId(UUID.randomUUID().toString());
      injectImporter.setInjectorContract(injectorContract);
      injectImporter.setRuleAttributes(new ArrayList<>());

      injectImporter.getRuleAttributes().add(createRuleAttribute());
      return injectImporter;
  }

  private RuleAttribute createRuleAttribute() {
      RuleAttribute ruleAttribute = new RuleAttribute();
      ruleAttribute.setColumns("Test");
      ruleAttribute.setName("Test");
      ruleAttribute.setId(UUID.randomUUID().toString());
      ruleAttribute.setAdditionalConfig(Map.of("test", "test"));
      ruleAttribute.setDefaultValue("");
      return ruleAttribute;
  }

}
