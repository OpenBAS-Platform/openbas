package io.openex.player.repository;

import io.openex.player.model.database.Inject;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InjectRepository extends CrudRepository<Inject<?>, String>, JpaSpecificationExecutor<Inject<?>> {

    Optional<Inject<?>> findById(String id);
}
