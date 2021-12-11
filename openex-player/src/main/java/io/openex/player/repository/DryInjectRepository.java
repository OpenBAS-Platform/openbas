package io.openex.player.repository;

import io.openex.player.model.database.DryInject;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryInjectRepository extends CrudRepository<DryInject<?>, String>, JpaSpecificationExecutor<DryInject<?>> {

    Optional<DryInject<?>> findById(String id);
}
