package io.openbas.database.repository;

import io.openbas.database.model.Cwe;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CweRepository extends CrudRepository<Cwe, String>, JpaSpecificationExecutor<Cwe> {}
