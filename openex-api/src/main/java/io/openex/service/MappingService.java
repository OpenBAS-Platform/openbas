package io.openex.service;

import io.openex.database.model.*;
import io.openex.database.repository.ExerciseRepository;
import io.openex.helper.SchemaHelper;
import io.openex.model.PropertySchema;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.support.Repositories;
import org.springframework.stereotype.Service;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Nullable;
import javax.transaction.Transactional;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.apache.commons.lang3.StringUtils.isBlank;

@Service
@RequiredArgsConstructor
public class MappingService {

  private final CsvFileService fileService;
  private final ExerciseRepository exerciseRepository;

  private final WebApplicationContext appContext;

  private Repositories repositories;

  // -- REPOSITORIES --

  @SuppressWarnings("unchecked")
  public <T extends Base> T save(@NotNull final T input) {
    try {
      CrudRepository<T, ?> repository = (CrudRepository<T, ?>) repository(input.getClass());
      return repository.save(input);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  // TODO: not performance at all
  @SuppressWarnings("unchecked")
  public <T extends Base> T find(@NotNull final T input) {
    try {
      CrudRepository<T, ?> repository = (CrudRepository<T, ?>) repository(input.getClass());
      Iterable<T> iterable = repository.findAll();
      List<T> list = StreamSupport.stream(iterable.spliterator(), false)
          .collect(Collectors.toList());
      PropertySchema uniqueProperty = SchemaHelper.getUniqueProperty(input);
      List<T> matches = SchemaHelper.find(list, input, uniqueProperty);
      if (matches.size() > 1) {
        throw new IllegalArgumentException("Not supported for now");
      } else if (matches.size() == 1) {
        return matches.get(0);
      } else {
        return null;
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @SuppressWarnings("unchecked")
  public <T extends Base> CrudRepository<T, ?> repository(@NotNull final Class<T> clazz) {
    if (this.repositories == null) {
      this.repositories = new Repositories(this.appContext);
    }

    return (CrudRepository<T, ?>) repositories.getRepositoryFor(clazz).orElseThrow();
  }

  // -- MAPPING --

  /**
   * Handle file with csv mapper
   */
  @Transactional(rollbackOn = Exception.class)
  public <T extends Base> void mapCsvFile(
      @Nullable final String exerciseId,
      @NotNull final MultipartFile file,
      @NotBlank final DataMapper dataMapper) {
    List<List<String>> records = this.fileService.parseCsvFile(file, dataMapper.getSeparator().getValue());
    this.mapCsvFile(exerciseId, records, dataMapper);
  }

  /**
   * Handle file path with csv mapper
   */
  @Transactional(rollbackOn = Exception.class)
  public <T extends Base> void mapCsvFile(
      @Nullable final String exerciseId,
      @NotBlank final String path,
      @NotNull final DataMapper dataMapper) {
    List<List<String>> records = this.fileService.parseCsvFilePath(path, dataMapper.getSeparator().getValue());
    this.mapCsvFile(exerciseId, records, dataMapper);
  }

  private <T extends Base> void mapCsvFile(
      @Nullable final String exerciseId,
      @NotNull List<List<String>> records,
      @NotNull final DataMapper dataMapper) {
    Exercise exercise = null;
    if (StringUtils.isNotBlank(exerciseId)) {
      exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
    }

    mappingProcess(records, dataMapper, exercise);
  }

  /**
   * Handle parse text with data mapper
   */
  private <T extends Base> void mappingProcess(
      @NotNull final List<List<String>> records,
      @NotNull final DataMapper dataMapper,
      @Nullable final Exercise exercise) {
    if (dataMapper.isHasHeader()) {
      records.remove(0);
    }

    Map<Class<T>, List<T>> resultMap = new HashMap<>();

    // Parallelize ???
    for (List<String> record : records) {

      Map<String, T> lineMap = new HashMap<>();
      List<DataMapperRepresentation> representations = dataMapper.getRepresentations();
      representations.stream()
          .sorted(DataMapperRepresentation::sort)
          .forEach((representation) -> {
            T result;
            try {
              result = mapRecord(record, representation, lineMap);
            } catch (Exception e) {
              throw new RuntimeException(e);
            }

            // TODO: Should retrieve first in DB
            T dbResult = this.find(result);
            if (dbResult != null) {
              result = SchemaHelper.merge(List.of(dbResult), result);
            }

            // Merge
            T mergeResult = SchemaHelper.merge(resultMap.get(representation.getClazz()), result);

            // Handle exercise
            if (exercise != null) {
              handleExercise(mergeResult, exercise);
            }

            T resultSaved = save(mergeResult);
            lineMap.put(representation.getName(), resultSaved);

            // Add to global map
            List<T> values = resultMap.get(representation.getClazz());
            if (values == null) {
              values = new ArrayList<>();
            }
            int idx = values.stream().map(Base::getId).toList().indexOf(resultSaved.getId());
            if (idx > -1) {
              values.set(idx, resultSaved);
            } else {
              values.add(resultSaved);
            }
            resultMap.put((Class<T>) representation.getClazz(), values);
          });
    }
    System.out.println(resultMap);
  }

  /**
   * Map parse text to target class
   */
  @SuppressWarnings("unchecked")
  private <T extends Base> T mapRecord(
      @NotNull final List<String> record,
      @NotNull final DataMapperRepresentation dataMapperRepresentation,
      @NotNull final Map<String, T> mapLine)
      throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
    Class<T> clazz = (Class<T>) dataMapperRepresentation.getClazz();
    // Retrieve schema
    List<PropertySchema> jsonSchema = SchemaHelper.schema(clazz);
    assert jsonSchema != null;

    // Prepare creation
    Constructor<T> constructor = clazz.getConstructor();
    T object = constructor.newInstance();

    // Compute properties
    List<DataMapperRepresentationProperty> properties = dataMapperRepresentation.getProperties();
    properties.forEach((property) -> {
      // Handle value
      Object value = "";
      if (StringUtils.isNotBlank(property.getColumnName())) {
        value = extractValue(record, property);
      } else if (property.getBasedOn() != null) {
        value = mapLine.get(property.getBasedOn());
      }

      // Sanity check
      PropertySchema jsonProperty = jsonSchema.stream()
          .filter((p) -> property.getPropertyName().equals(p.getName()))
          .findFirst()
          .orElseThrow();

      if ((value == null || (value instanceof String && isBlank(value.toString()))) && jsonProperty.isMandatory()) {
        throw new IllegalArgumentException("This property is mandatory"); // OR skip it ?
      }

      // Set value
      if (value != null) {
        Object finalValue = jsonProperty.isMultiple() ? new ArrayList<>(List.of(value)) : value;
        SchemaHelper.setPropertyValue(clazz, jsonProperty.getName(), object, finalValue);
      }
    });
    return object;
  }

  /**
   * Extract value from parse text
   */
  private String extractValue(
      @NotNull final List<String> record,
      @NotNull final DataMapperRepresentationProperty property) {
    int idx = CsvFileService.columnNameToIdx(property.getColumnName());
    assert idx != -1;
    return record.get(idx);
  }

  // -- EXERCISE --

  private <T extends Base> void handleExercise(
      @NotNull T input,
      @NotNull final Exercise exercise) {
    List<Class<?>> classInterfaces = Arrays.stream(input.getClass().getInterfaces()).toList();
    if (classInterfaces.contains(ExerciseDependent.class)) {
      SchemaHelper.setPropertyValue(input.getClass(), "exercise", input, exercise);
    }
  }

}
