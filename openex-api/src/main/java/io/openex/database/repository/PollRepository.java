package io.openex.database.repository;

import io.openex.database.model.Poll;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PollRepository extends CrudRepository<Poll, String>, JpaSpecificationExecutor<Poll> {

    @NotNull
    Optional<Poll> findById(@NotNull String id);
}
