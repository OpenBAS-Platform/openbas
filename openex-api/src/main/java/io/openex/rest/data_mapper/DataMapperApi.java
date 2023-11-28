package io.openex.rest.data_mapper;

import io.openex.database.model.DataMapper;
import io.openex.rest.data_mapper.form.DataMapperInput;
import io.openex.service.DataMapperService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;

@RequiredArgsConstructor
@RestController
@RolesAllowed(ROLE_USER)
public class DataMapperApi {

  private final DataMapperService dataMapperService;

  // -- INSTANCE --

  @PostMapping("/api/data_mappers")
  @RolesAllowed(ROLE_ADMIN)
  public DataMapper createDataMapper(@Valid @RequestBody final DataMapperInput input) {
    DataMapper dataMapper = new DataMapper();
    dataMapper.setUpdateAttributes(input);
    return this.dataMapperService.createDataMapper(dataMapper);
  }

  @GetMapping("/api/data_mappers")
  @RolesAllowed(ROLE_ADMIN)
  public Iterable<DataMapper> dataMappers() {
    return this.dataMapperService.dataMappers();
  }

  @GetMapping("/api/exercises/{exerciseId}/data_mappers")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<DataMapper> dataMappers(
      @PathVariable @NotBlank final String exerciseId,
      @RequestParam @NotBlank final String type) {
    return this.dataMapperService.dataMappers(type);
  }

  @PutMapping("/api/data_mappers/{dataMapperId}")
  @RolesAllowed(ROLE_ADMIN)
  public DataMapper updateDataMapper(
      @PathVariable @NotBlank final String dataMapperId,
      @Valid @RequestBody final DataMapperInput input) {
    DataMapper dataMapper = this.dataMapperService.dataMapper(dataMapperId);
    dataMapper.setUpdateAttributes(input);
    return this.dataMapperService.updateDataMapper(dataMapper);
  }

  @DeleteMapping("/api/data_mappers/{dataMapperId}")
  @RolesAllowed(ROLE_ADMIN)
  public void deleteDataMapper(@PathVariable @NotBlank final String dataMapperId) {
    this.dataMapperService.deleteDataMapper(dataMapperId);
  }

  // -- DEFINITION --

  @GetMapping("/api/data_mapper_definitions")
  @RolesAllowed(ROLE_ADMIN)
  public Iterable<DataMapper> dataMapperDefinitions(@RequestParam @NotBlank final String type) {
    return this.dataMapperService.dataMapperDefinition(type);
  }

  // -- MAPPING --

  @PostMapping("/api/exercises/{exerciseId}/mapping/{dataMapperId}")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public void mapping(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String dataMapperId,
      @RequestPart("file") @NotNull final MultipartFile file) {
    this.dataMapperService.mapping(exerciseId, file, dataMapperId);
  }

  @PostMapping("/api/mapping/{dataMapperId}")
  @RolesAllowed(ROLE_ADMIN)
  public void mapping(
      @PathVariable @NotBlank final String dataMapperId,
      @RequestPart("file") @NotNull final MultipartFile file) {
    this.dataMapperService.mapping(null, file, dataMapperId);
  }

}
