package io.openbas.database.repository;

import io.openbas.database.model.RuleAttribute;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleAttributeRepository extends CrudRepository<RuleAttribute, UUID> {}
