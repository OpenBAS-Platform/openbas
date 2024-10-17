package io.openbas.database.repository;

import io.openbas.database.model.LessonsCategory;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonsCategoryRepository
    extends CrudRepository<LessonsCategory, String>, JpaSpecificationExecutor<LessonsCategory> {

  @NotNull
  Optional<LessonsCategory> findById(@NotNull String id);
}
