package io.openex.database.repository;

import io.openex.database.model.LessonsTemplateQuestion;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface LessonsTemplateQuestionRepository extends CrudRepository<LessonsTemplateQuestion, String>, JpaSpecificationExecutor<LessonsTemplateQuestion> {

    @NotNull
    Optional<LessonsTemplateQuestion> findById(@NotNull String id);
}
