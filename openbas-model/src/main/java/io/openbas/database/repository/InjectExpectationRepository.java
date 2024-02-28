package io.openbas.database.repository;

import io.openbas.database.model.InjectExpectation;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

@Repository
public interface InjectExpectationRepository extends CrudRepository<InjectExpectation, String>, JpaSpecificationExecutor<InjectExpectation> {

    @NotNull
    Optional<InjectExpectation> findById(@NotNull String id);

    @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId")
    List<InjectExpectation> findAllForExercise(@Param("exerciseId") String exerciseId);

    @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId and i.inject.id = :injectId")
    List<InjectExpectation> findAllForExerciseAndInject(
        @Param("exerciseId") @NotBlank final String exerciseId,
        @Param("injectId") @NotBlank final String injectId
    );

    @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId " +
            "and i.type = 'CHALLENGE' and i.team.id IN (:teamIds)")
    List<InjectExpectation> findChallengeExpectations(@Param("exerciseId") String exerciseId,
                                                     @Param("teamIds") List<String> teamIds);

    @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId " +
            "and i.challenge.id = :challengeId and i.team.id IN (:teamIds)")
    List<InjectExpectation> findChallengeExpectations(@Param("exerciseId") String exerciseId,
                                               @Param("teamIds") List<String> teamIds,
                                               @Param("challengeId") String challengeId);

    @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId and i.asset.id = :assetId")
    InjectExpectation findTechnicalExpectationForAsset(@Param("exerciseId") String exerciseId, @Param("assetId") String assetId);

    @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId and i.asset.id IN :assetIds")
    List<InjectExpectation> findTechnicalExpectationsForAssets(@Param("exerciseId") String exerciseId, @Param("assetIds") List<String> assetIds);

    @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId and i.assetGroup.id IN :assetGroupId")
    InjectExpectation findTechnicalExpectationForAssetGroup(@Param("exerciseId") String exerciseId, @Param("assetGroupId") String assetGroupId);

    @Modifying
    @Query(value = "delete from InjectExpectation i where i.exercise.id = :exerciseId")
    void deleteAllForExercise(@Param("exerciseId") String exerciseId);
}
