package io.openex.database.repository;

import io.openex.database.model.LessonsCategory;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface LessonsCategoryRepository extends CrudRepository<LessonsCategory, String>, JpaSpecificationExecutor<LessonsCategory> {

    @NotNull
    Optional<LessonsCategory> findById(@NotNull String id);
}
