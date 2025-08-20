package io.openbas.jsonapi;

import static io.openbas.jsonapi.GenericJsonApiIUtils.resolveType;
import static io.openbas.utils.reflection.ClazzUtils.instantiate;
import static io.openbas.utils.reflection.CollectionUtils.*;
import static io.openbas.utils.reflection.FieldUtils.getAllFieldsAsMap;
import static io.openbas.utils.reflection.FieldUtils.setField;
import static io.openbas.utils.reflection.RelationUtils.getAllRelationsAsMap;
import static io.openbas.utils.reflection.RelationUtils.setInverseRelation;
import static org.springframework.util.StringUtils.hasText;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Base;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Id;
import jakarta.persistence.metamodel.EntityType;
import java.lang.reflect.Field;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/* Based on https://jsonapi.org/ */
@Component
@RequiredArgsConstructor
public class GenericJsonApiImporter<T extends Base> {

  private final EntityManager entityManager;
  @Resource private final ObjectMapper objectMapper;

  @Transactional
  public T upsert(JsonApiDocument<ResourceObject> doc, boolean withRels) {
    if (doc == null || doc.data() == null) {
      throw new IllegalArgumentException("Data is required to import document");
    }
    Map<String, ResourceObject> includedMap = toMap(doc.included());
    Map<String, T> entityCache = new HashMap<>();
    T entity = buildEntity(doc.data(), includedMap, entityCache, withRels, true);

    // merge/upsert
    return entityManager.merge(entity);
  }

  private Map<String, ResourceObject> toMap(List<Object> included) {
    if (included == null || included.isEmpty()) {
      return Map.of();
    }
    Map<String, ResourceObject> map = new LinkedHashMap<>();
    for (Object o : included) {
      ResourceObject ro = (ResourceObject) safeConvert(o, ResourceObject.class);
      if (ro != null) map.put(ro.id(), ro);
    }
    return map;
  }

  private T buildEntity(
      ResourceObject resource,
      Map<String, ResourceObject> includedMap,
      Map<String, T> entityCache,
      boolean withRels,
      boolean rootEntity) {
    // Sanity check
    if (resource == null) {
      return null;
    }
    if (entityCache == null) {
      entityCache = new HashMap<>();
    }

    String id = resource.id();
    String type = resource.type();

    if (entityCache.containsKey(id)) {
      return entityCache.get(id);
    }

    Class<T> clazz = classForTypeOrThrow(type);

    // Instantiate or load
    T entity = null;

    // For non-root entities with a valid ID and not marked as @InnerRelationship,
    // try loading the existing entity from the database.
    if (!rootEntity && hasText(id) && !clazz.isAnnotationPresent(InnerRelationship.class)) {
      entity = entityManager.find(clazz, id);
    }
    // Create new instance if not found.
    if (entity == null) {
      entity = instantiate(clazz);
      // For @InnerRelationship, set ID to preserve reference
      // (example: widget config linked to custom dashboard parameters)
      if (clazz.isAnnotationPresent(InnerRelationship.class)) {
        entity.setId(id);
      }
    }
    entityCache.put(id, entity);

    // Populate
    applyAttributes(entity, resource.attributes());
    applyRelationships(entity, resource.relationships(), includedMap, entityCache, withRels);

    return entity;
  }

  private void applyAttributes(T entity, Map<String, Object> attributes) {
    if (entity == null || attributes == null || attributes.isEmpty()) {
      return;
    }
    Map<String, Field> fields = getAllFieldsAsMap(entity.getClass());
    for (var e : attributes.entrySet()) {
      Field f = fields.get(e.getKey());
      if (f == null || f.isAnnotationPresent(Id.class)) {
        continue;
      }
      Object cast = safeConvert(e.getValue(), f.getType());
      setField(entity, f, cast);
    }
  }

  private void applyRelationships(
      Object entity,
      Map<String, Relationship> rels,
      Map<String, ResourceObject> includedMap,
      Map<String, T> entityCache,
      boolean withRels) {
    if (!withRels) {
      return;
    }
    if (entity == null || rels == null || rels.isEmpty()) {
      return;
    }

    Map<String, Field> relations = getAllRelationsAsMap(entity.getClass());

    for (var e : rels.entrySet()) {
      Field f = relations.get(e.getKey());
      if (f == null) {
        continue;
      }

      Relationship rel = e.getValue();
      if (isCollection(f)) {
        List<ResourceIdentifier> ids = rel.asMany();

        Collection<Object> target = instantiateCollection(f);
        for (ResourceIdentifier ri : ids) {
          Object child = resolveOrBuildEntity(ri, includedMap, entityCache, withRels);
          if (child != null) {
            target.add(child);
            setInverseRelation(child, entity);
          }
        }
        replaceCollection(entity, f, target);

      } else {
        ResourceIdentifier ri = rel.asOne();
        Object child =
            (ri != null) ? resolveOrBuildEntity(ri, includedMap, entityCache, withRels) : null;
        setField(entity, f, child);
        if (child != null) {
          setInverseRelation(child, entity);
        }
      }
    }
  }

  private T resolveOrBuildEntity(
      ResourceIdentifier resourceIdentifier,
      Map<String, ResourceObject> includedMap,
      Map<String, T> entityCache,
      boolean withRels) {
    if (resourceIdentifier == null) {
      return null;
    }

    String id = resourceIdentifier.id();
    String type = resourceIdentifier.type();

    // Available in the bundle
    ResourceObject included = includedMap.get(id);
    if (included != null) {
      return buildEntity(included, includedMap, entityCache, withRels, false);
    }

    // Not present in the bundle, resolve it
    Class<T> clazz = classForTypeOrThrow(type);
    return hasText(id) ? entityManager.getReference(clazz, id) : null;
  }

  private final Map<String, Class<T>> typeToClassCache = new HashMap<>();

  @SuppressWarnings("unchecked")
  private Class<T> classForTypeOrThrow(String type) {
    if (type == null || type.isBlank()) {
      throw new IllegalArgumentException("Type is required");
    }

    Class<T> cached = typeToClassCache.get(type);
    if (cached != null) {
      return cached;
    }

    for (EntityType<?> et : entityManager.getMetamodel().getEntities()) {
      Class<T> javaType = (Class<T>) et.getJavaType();
      String resolved = resolveType(javaType);
      typeToClassCache.putIfAbsent(resolved, javaType);
    }

    Class<T> found = typeToClassCache.get(type);
    if (found != null) {
      return found;
    }

    throw new IllegalArgumentException("Unknown type: " + type);
  }

  private Object safeConvert(Object value, Class<?> targetType) {
    if (value == null) {
      return null;
    }
    if (targetType.isInstance(value)) {
      return value;
    }
    return objectMapper.convertValue(value, targetType);
  }
}
