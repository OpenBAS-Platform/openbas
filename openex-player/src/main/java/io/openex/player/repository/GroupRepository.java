package io.openex.player.repository;

import io.openex.player.model.database.Group;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupRepository extends CrudRepository<Group, String>, JpaSpecificationExecutor<Group> {

    Optional<Group> findById(String id);
}
