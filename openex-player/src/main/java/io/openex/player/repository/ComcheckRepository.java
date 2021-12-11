package io.openex.player.repository;

import io.openex.player.model.database.Comcheck;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComcheckRepository extends CrudRepository<Comcheck, String>, JpaSpecificationExecutor<Comcheck> {

    Optional<Comcheck> findById(String id);
}
