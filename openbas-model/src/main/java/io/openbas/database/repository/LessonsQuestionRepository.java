package io.openbas.database.repository;

import io.openbas.database.model.LessonsQuestion;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonsQuestionRepository
    extends CrudRepository<LessonsQuestion, String>, JpaSpecificationExecutor<LessonsQuestion> {

  @NotNull
  Optional<LessonsQuestion> findById(@NotNull String id);
}
