package io.openex.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.model.CsvMapper;
import io.openex.model.CsvMapperRepresentation;
import io.openex.model.CsvMapperRepresentationProperty;
import io.openex.model.PropertySchema;
import io.openex.model.PropertySchema.PropertySchemaBuilder;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.support.Repositories;
import org.springframework.stereotype.Service;
import org.springframework.web.context.WebApplicationContext;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.lang.annotation.Annotation;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MappingService {

  private final FileService fileService;

  private final List<Class<?>> requiredAnnotations = List.of(
      NotNull.class,
      NotBlank.class,
      Email.class
  );

  private final WebApplicationContext appContext;

  private Repositories repositories;

  // -- SCHEMA --

  public List<PropertySchema> schema(@NotNull final Class<?> clazz) {
    Field[] fields = clazz.getDeclaredFields();
    return Arrays.stream(fields).map(field -> {
      PropertySchemaBuilder builder = PropertySchema.builder()
          .name(field.getName()) // Name
          .type(field.getType()) // Type
          .multiple(field.getType().isArray() || Collection.class.isAssignableFrom(field.getType())); // Cardinality

      Annotation[] annotations = field.getDeclaredAnnotations();
      for (Annotation annotation : annotations) {
        // Json Name
        if (annotation.annotationType().equals(JsonProperty.class)) {
          builder.jsonName(((JsonProperty) annotation).value());
        }
        // Required
        if (this.requiredAnnotations.contains(annotation.annotationType())) {
          builder.mandatory(true);
        }
      }
      return builder.build();
    }).toList();
  }

  // -- REPOSITORIES --

  public CrudRepository<?, ?> repository(@NotNull final Class<?> clazz) {
    if (this.repositories == null) {
      this.repositories = new Repositories(this.appContext);
    }

    return (CrudRepository<?, ?>) repositories.getRepositoryFor(clazz).orElseThrow();
  }

  // -- MAPPING --

  public List<Tuple2<?, CrudRepository<?, ?>>> mapCsvFile(@NotBlank final String path,
      @NotNull final CsvMapper csvMapper) {
    List<List<String>> records = this.fileService.parseCsvFile(path, csvMapper.getSeparator().getValue());

    return mappingProcess(records, csvMapper);
  }

  private List<Tuple2<?, CrudRepository<?, ?>>> mappingProcess(@NotNull final List<List<String>> records,
      @NotNull final CsvMapper csvMapper) {
    if (csvMapper.isHasHeader()) {
      records.remove(0);
    }

    List<Tuple2<?, CrudRepository<?, ?>>> results = new ArrayList<>();

    // Parallelize ???
    for (List<String> record : records) {
      List<CsvMapperRepresentation> representations = csvMapper.getRepresentations();
      representations.forEach((representation) -> {
        Object result;
        CrudRepository<?, ?> repository = this.repository(representation.getClazz());
        try {
          result = mapRecord(record, representation);
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
        results.add(Tuples.of(result, repository));
      });
    }

    return results;
  }

  private Object mapRecord(@NotNull final List<String> record,
      @NotNull final CsvMapperRepresentation csvMapperRepresentation)
      throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
    Class<?> clazz = csvMapperRepresentation.getClazz();
    // Retrieve schema
    List<PropertySchema> jsonSchema = this.schema(clazz);
    assert jsonSchema != null;

    // Prepare creation
    Constructor<?> constructor = clazz.getConstructor();
    Object object = constructor.newInstance();

    // Compute properties
    List<CsvMapperRepresentationProperty> properties = csvMapperRepresentation.getProperties();
    properties.forEach((property) -> {
      // Extract value from CSV
      String value = extractValue(record, property);

      // Sanity check
      PropertySchema jsonProperty = jsonSchema.stream()
          .filter((p) -> property.getPropertyName().equals(p.getJsonName())).findFirst().orElseThrow();

      if (StringUtils.isBlank(value) && jsonProperty.isMandatory()) {
        throw new IllegalArgumentException("This property is mandatory"); // OR skip it ?
      }

      // Set property value
      Field field;
      try {
        field = clazz.getDeclaredField(jsonProperty.getName());
        field.setAccessible(true);
        field.set(object, jsonProperty.isMultiple() ? List.of(value) : value);
      } catch (IllegalAccessException | NoSuchFieldException e) {
        throw new RuntimeException(e);
      }
    });
    return object;
  }

  private String extractValue(
      @NotNull final List<String> record,
      @NotNull final CsvMapperRepresentationProperty property) {
    int idx = FileService.columnNameToIdx(property.getColumnName());
    assert idx != -1;
    return record.get(idx);
  }

}
