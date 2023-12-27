package io.openex.database.repository;

import io.openex.database.model.Challenge;
import io.openex.database.model.Team;
import javax.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends CrudRepository<Team, String>, JpaSpecificationExecutor<Team> {

    @NotNull
    Optional<Team> findById(@NotNull String id);

    List<Team> findByNameIgnoreCase(String name);
}
