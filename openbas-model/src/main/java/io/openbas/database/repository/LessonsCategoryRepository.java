package io.openbas.database.repository;

import io.openbas.database.model.LessonsCategory;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonsCategoryRepository extends CrudRepository<LessonsCategory, String>, JpaSpecificationExecutor<LessonsCategory> {

    @NotNull
    Optional<LessonsCategory> findById(@NotNull String id);

    // -- TEAM -

    @Modifying
    @Query(
        value = "DELETE FROM lessons_categories_teams lct "
            + "WHERE lct.team_id IN :teamIds "
            + "AND EXISTS (SELECT 1 FROM lessons_categories lc WHERE lct.lessons_category_id = lc.lessons_category_id AND lc.lessons_category_exercise = :exerciseId)",
        nativeQuery = true
    )
    @Transactional
    void removeTeamsForExercise(@Param("exerciseId") final String exerciseId, @Param("teamIds") final List<String> teamIds);

    @Modifying
    @Query(
        value = "DELETE FROM lessons_categories_teams lct "
            + "WHERE lct.team_id IN :teamIds "
            + "AND EXISTS (SELECT 1 FROM lessons_categories lc WHERE lct.lessons_category_id = lc.lessons_category_id AND lc.lessons_category_scenario = :scenarioId)",
        nativeQuery = true
    )
    @Transactional
    void removeTeamsForScenario(@Param("scenarioId") final String scenarioId, @Param("teamIds") final List<String> teamIds);


}
