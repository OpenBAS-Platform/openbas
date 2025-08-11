package io.openbas.service;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.rest.attack_pattern.service.AttackPatternService;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.types.BaseType;
import io.openbas.stix.types.Identifier;
import io.openbas.stix.types.Timestamp;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SimulationStixService {
  private final AttackPatternService attackPatternService;

  public ObjectBase getCoverageForEntity(ObjectBase entity, Exercise exercise) {
    ObjectBase result = new ObjectBase();
    Map<String, BaseType<?>> properties = new HashMap<>();
    result.setProperties(properties);

    // standard properties
    properties.put("id", new Identifier("security-coverage--" + exercise.getId()));
    properties.put("created", new Timestamp(exercise.getCreatedAt()));
    properties.put("modified", new Timestamp(Instant.now()));
    properties.put("coverage_context_ref", entity.getProperties().get("id"));

    String type = (String) entity.getProperties().get("type").getValue();
    switch (type) {
      case "vulnerability":
        break;
      case "attack-pattern":
        break;
      default:
        throw new UnsupportedOperationException("could not process coverage for entity" + entity.getProperties().get("id").getValue());
    }

    return result;
  }

  private BaseType<?> getAttackPatternCoverage(ObjectBase entity, Exercise exercise) {
    String attackPatternExternalId = (String) entity.getProperties().get("x_mitre_id").getValue();
    List<AttackPattern> apList = attackPatternService.getAttackPatternsByExternalIdsThrowIfMissing(Set.of(attackPatternExternalId));
    Optional<AttackPattern> ap = apList.stream().findFirst();
    if (ap.isEmpty()) {
      return uncovered();
    }

    // get all injects involved in attack pattern
    List<Inject> injects = exercise.getInjects().stream().filter(i -> i.getInjectorContract().isPresent() && i.getInjectorContract().get().getAttackPatterns().contains(ap.get())).toList();
    if(injects.isEmpty()) {
      return uncovered();
    }

    return null;
  }

  private BaseType<?> uncovered() {
    return new io.openbas.stix.types.Dictionary(new HashMap<>());
  }
}
