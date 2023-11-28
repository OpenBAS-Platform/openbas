package io.openex.service;

import io.openex.database.model.DataMapper;
import io.openex.database.repository.DataMapperRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Nullable;
import javax.annotation.PostConstruct;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

import static io.openex.database.specification.DataMapperSpecification.fromType;
import static io.openex.helper.DataMapperDefinitionHelper.dataMapperAudienceDefinition;
import static io.openex.helper.DataMapperDefinitionHelper.dataMapperPlayerDefinition;
import static java.time.Instant.now;

@Service
@RequiredArgsConstructor
public class DataMapperService {

  private final DataMapperRepository dataMapperRepository;
  private final MappingService mappingService;

  private List<DataMapper> dataMapperDefinitions;

  @PostConstruct
  public void init() {
    this.dataMapperDefinitions = List.of(
        dataMapperPlayerDefinition(),
        dataMapperAudienceDefinition()
    );
  }

  // -- INSTANCE --

  public DataMapper createDataMapper(@NotBlank final DataMapper dataMapper) {
    return this.dataMapperRepository.save(dataMapper);
  }

  public DataMapper dataMapper(@NotBlank final String dataMapperId) {
    return this.dataMapperRepository.findById(dataMapperId).orElseThrow();
  }

  public Iterable<DataMapper> dataMappers() {
    return this.dataMapperRepository.findAll();
  }

  public Iterable<DataMapper> dataMappers(@NotBlank final String type) {
    DataMapper.TYPE dataMapperType = DataMapper.TYPE.findByValue(type);
    return this.dataMapperRepository.findAll(fromType(dataMapperType));
  }

  public DataMapper updateDataMapper(@NotNull final DataMapper dataMapper) {
    dataMapper.setUpdatedAt(now());
    return this.dataMapperRepository.save(dataMapper);
  }

  public void deleteDataMapper(@NotBlank final String dataMapperId) {
    this.dataMapperRepository.deleteById(dataMapperId);
  }

  // -- DEFINITION --

  public List<DataMapper> dataMapperDefinition(@NotBlank final String type) {
    DataMapper.TYPE dataMapperType = DataMapper.TYPE.findByValue(type);
    return this.dataMapperDefinitions.stream()
        .filter((dataMapper -> dataMapperType.equals(dataMapper.getType())))
        .toList();
  }

  // -- MAPPING --

  public void mapping(
      @Nullable final String exerciseId,
      @NotNull final MultipartFile file,
      @NotBlank final String dataMapperId) {
    DataMapper dataMapper = this.dataMapper(dataMapperId);
    this.mappingService.mapCsvFile(exerciseId, file, dataMapper);
  }

}
