package io.openex.database.repository;

import io.openex.database.model.Variable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariableRepository extends CrudRepository<Variable, String>, JpaSpecificationExecutor<Variable> {

}
