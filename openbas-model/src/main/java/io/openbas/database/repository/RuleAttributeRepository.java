package io.openbas.database.repository;

import io.openbas.database.model.RuleAttribute;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RuleAttributeRepository extends CrudRepository<RuleAttribute, UUID> {
}
