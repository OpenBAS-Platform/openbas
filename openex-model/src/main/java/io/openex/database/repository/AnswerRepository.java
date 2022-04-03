package io.openex.database.repository;

import io.openex.database.model.Answer;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface AnswerRepository extends CrudRepository<Answer, String>, JpaSpecificationExecutor<Answer> {

    @NotNull
    Optional<Answer> findById(@NotNull String id);
}
