package io.openbas.jsonapi;

import static io.openbas.jsonapi.GenericJsonApiIUtils.resolveType;
import static io.openbas.utils.reflection.ClazzUtils.readId;
import static io.openbas.utils.reflection.CollectionUtils.isCollection;
import static io.openbas.utils.reflection.CollectionUtils.toCollection;
import static io.openbas.utils.reflection.FieldUtils.*;
import static io.openbas.utils.reflection.RelationUtils.isRelation;

import java.lang.reflect.Field;
import java.util.*;
import org.springframework.stereotype.Component;

/* Based on https://jsonapi.org/ */
@Component
public class GenericJsonApiExporter {

  public JsonApiDocument<ResourceObject> handleExport(Object entity, boolean withRels) {
    Set<Object> visited = Collections.newSetFromMap(new IdentityHashMap<>());
    List<ResourceObject> included = new ArrayList<>();
    ResourceObject root = toResource(entity, withRels, visited, included);
    return new JsonApiDocument<>(root, included.isEmpty() ? null : new ArrayList<>(included));
  }

  private ResourceObject toResource(
      Object entity, boolean withRels, Set<Object> visited, List<ResourceObject> included) {
    // Sanity check
    if (entity == null) {
      return null;
    }
    // Skip loop
    if (!visited.add(entity)) {
      return null;
    }

    Class<?> clazz = entity.getClass();
    String type = resolveType(clazz);
    String id = readId(entity);

    Map<String, Object> attrs = getAllFieldValuesAsMap(entity);
    Map<String, Relationship> rels =
        withRels ? extractRelationships(entity, withRels, visited, included) : null;

    return new ResourceObject(id, type, attrs, rels);
  }

  private Map<String, Relationship> extractRelationships(
      Object entity, boolean withRels, Set<Object> visited, List<ResourceObject> included) {
    Map<String, Relationship> rels = new LinkedHashMap<>();
    for (Field f : getAllFields(entity.getClass())) {
      if (!isRelation(f)) {
        continue;
      }

      Object value = getField(entity, f);
      if (value == null) {
        continue;
      }

      if (isCollection(f)) {
        extractRelationshipValues(entity, withRels, visited, included, rels, f);
      } else {
        extractRelationshipValue(entity, withRels, visited, included, rels, f);
      }
    }
    return rels.isEmpty() ? null : rels;
  }

  private void extractRelationshipValues(
      Object entity,
      boolean withRels,
      Set<Object> visited,
      List<ResourceObject> included,
      Map<String, Relationship> rels,
      Field f) {
    String relName = resolveFieldJsonName(f);
    Object value = getField(entity, f);
    Collection<?> col = toCollection(value);
    if (col.isEmpty()) {
      return;
    }

    List<ResourceIdentifier> ids = new ArrayList<>();
    for (Object child : col) {
      ids.add(new ResourceIdentifier(readId(child), resolveType(child.getClass())));
    }
    rels.put(relName, new Relationship(ids));

    for (Object child : col) {
      var ro = toResource(child, withRels, visited, included);
      if (ro != null) {
        included.add(ro);
      }
    }
  }

  private void extractRelationshipValue(
      Object entity,
      boolean withRels,
      Set<Object> visited,
      List<ResourceObject> included,
      Map<String, Relationship> rels,
      Field f) {
    String relName = resolveFieldJsonName(f);
    Object value = getField(entity, f);
    rels.put(
        relName,
        new Relationship(new ResourceIdentifier(readId(value), resolveType(value.getClass()))));
    var ro = toResource(value, withRels, visited, included);
    if (ro != null) {
      included.add(ro);
    }
  }
}
