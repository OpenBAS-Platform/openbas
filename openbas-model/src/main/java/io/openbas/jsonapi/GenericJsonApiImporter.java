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
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Id;
import jakarta.persistence.metamodel.EntityType;
import java.lang.reflect.Field;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class GenericJsonApiImporter {

  private final EntityManager entityManager;
  @Resource private final ObjectMapper objectMapper;

  @Transactional
  public Object upsert(JsonApiDocument<ResourceObject> doc, boolean withRels) {
    if (doc == null || doc.data() == null) {
      throw new IllegalArgumentException("Data is required to import document");
    }
    Map<String, ResourceObject> includedMap = toMap(doc.included());
    Object entity = buildEntity(doc.data(), includedMap, new HashMap<>(), withRels);

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
      map.put(ro.id(), ro);
    }
    return map;
  }

  private Object buildEntity(
      ResourceObject resource,
      Map<String, ResourceObject> includedMap,
      Map<String, Object> cache,
      boolean withRels) {
    // Sanity check
    if (resource == null) {
      return null;
    }
    if (cache == null) {
      cache = new HashMap<>();
    }

    String id = resource.id();
    String type = resource.type();

    if (cache.containsKey(id)) {
      return cache.get(id);
    }

    Class<?> clazz = classForTypeOrThrow(type);

    // Instantiate or load
    Object entity = null;
    if (hasText(id)) {
      entity = entityManager.find(clazz, id);
    }
    if (entity == null) {
      entity = instantiate(clazz);
    }
    cache.put(id, entity);

    // Populate
    applyAttributes(entity, resource.attributes());
    applyRelationships(entity, resource.relationships(), includedMap, cache, withRels);

    return entity;
  }

  private void applyAttributes(Object entity, Map<String, Object> attributes) {
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
      Map<String, Object> cache,
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
        @SuppressWarnings("unchecked")
        List<ResourceIdentifier> ids = rel.asMany();

        Collection<Object> target = instantiateCollection(f);
        for (ResourceIdentifier ri : ids) {
          Object child = resolveOrBuildEntity(ri, includedMap, cache, withRels);
          if (child != null) {
            target.add(child);
            setInverseRelation(child, entity);
          }
        }
        replaceCollection(entity, f, target);

      } else {
        ResourceIdentifier ri = rel.asOne();
        Object child = (ri != null) ? resolveOrBuildEntity(ri, includedMap, cache, withRels) : null;
        setField(entity, f, child);
        if (child != null) {
          setInverseRelation(child, entity);
        }
      }
    }
  }

  private Object resolveOrBuildEntity(
      ResourceIdentifier resourceIdentifier,
      Map<String, ResourceObject> includedMap,
      Map<String, Object> cache,
      boolean withRels) {
    if (resourceIdentifier == null) {
      return null;
    }

    String id = resourceIdentifier.id();
    String type = resourceIdentifier.type();

    // Available in the bundle
    ResourceObject included = includedMap.get(id);
    if (included != null) {
      return buildEntity(included, includedMap, cache, withRels);
    }

    // Not present in the bundle, resolve it
    Class<?> clazz = classForTypeOrThrow(type);
    return hasText(id) ? entityManager.getReference(clazz, id) : null;
  }

  private final Map<String, Class<?>> typeToClassCache = new HashMap<>();

  private Class<?> classForTypeOrThrow(String type) {
    if (type == null || type.isBlank()) {
      throw new IllegalArgumentException("Type is required");
    }

    Class<?> cached = typeToClassCache.get(type);
    if (cached != null) {
      return cached;
    }

    for (EntityType<?> et : entityManager.getMetamodel().getEntities()) {
      Class<?> javaType = et.getJavaType();
      String resolved = resolveType(javaType);
      typeToClassCache.putIfAbsent(resolved, javaType);
    }

    Class<?> found = typeToClassCache.get(type);
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
