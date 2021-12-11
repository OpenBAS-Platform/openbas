package io.openex.player.repository;

import io.openex.player.model.database.Objective;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ObjectiveRepository extends CrudRepository<Objective, String>, JpaSpecificationExecutor<Objective> {

    List<Objective> findByTitle(String title);

    Optional<Objective> findById(String id);
}
