package io.openex.player.repository;

import io.openex.player.model.database.SubObjective;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubObjectiveRepository extends CrudRepository<SubObjective, String>, JpaSpecificationExecutor<SubObjective> {

    List<SubObjective> findByTitle(String title);

    Optional<SubObjective> findById(String id);
}
