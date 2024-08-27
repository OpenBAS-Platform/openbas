package io.openbas.database.repository;

import io.openbas.database.model.LessonsAnswer;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LessonsAnswerRepository extends CrudRepository<LessonsAnswer, String>,
    JpaSpecificationExecutor<LessonsAnswer> {

  @NotNull
  Optional<LessonsAnswer> findById(@NotNull String id);

  Optional<LessonsAnswer> findByUserIdAndQuestionId(@NotNull String userId, @NotNull String questionId);
}
