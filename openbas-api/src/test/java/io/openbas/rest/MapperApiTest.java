package io.openbas.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.ImportMapper;
import io.openbas.database.repository.ImportMapperRepository;
import io.openbas.rest.mapper.MapperApi;
import io.openbas.rest.mapper.form.ImportMapperAddInput;
import io.openbas.rest.mapper.form.ImportMapperUpdateInput;
import io.openbas.service.MapperService;
import io.openbas.utils.fixtures.PaginationFixture;
import io.openbas.utils.mockMapper.MockMapperUtils;
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

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

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
  private MapperService mapperService;

  private MapperApi mapperApi;

  @Autowired
  private ObjectMapper objectMapper;

  @BeforeEach
  void before() throws IllegalAccessException, NoSuchFieldException {
    // Injecting mocks into the controller
    mapperApi = new MapperApi(importMapperRepository, mapperService);

    Field sessionContextField = MapperApi.class.getSuperclass().getDeclaredField("mapper");
    sessionContextField.setAccessible(true);
    sessionContextField.set(mapperApi, objectMapper);

    mvc = MockMvcBuilders.standaloneSetup(mapperApi)
            .build();
  }

  // -- SCENARIOS --

  @DisplayName("Test search of mappers")
  @Test
  void searchMappers() throws Exception {
    // -- PREPARE --
    List<ImportMapper> importMappers = List.of(MockMapperUtils.createImportMapper());
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
    ImportMapper importMapper = MockMapperUtils.createImportMapper();
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
    ImportMapper importMapper = MockMapperUtils.createImportMapper();
    ImportMapperAddInput importMapperInput = new ImportMapperAddInput();
    importMapperInput.setName("Test");
    when(mapperService.createAndSaveImportMapper(any())).thenReturn(importMapper);
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
    ImportMapper importMapper = MockMapperUtils.createImportMapper();
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
  void updateSpecificMapper() throws Exception {
    // -- PREPARE --
    ImportMapper importMapper = MockMapperUtils.createImportMapper();
    ImportMapperUpdateInput importMapperInput = new ImportMapperUpdateInput();
    importMapperInput.setName("New name");
    when(mapperService.updateImportMapper(any(), any())).thenReturn(importMapper);
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

}
