package io.openex.database.repository;

import io.openex.database.model.InjectExpectation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface InjectExpectationRepository extends CrudRepository<InjectExpectation, String> {

    @NotNull
    Optional<InjectExpectation> findById(@NotNull String id);
}
