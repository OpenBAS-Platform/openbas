package io.openbas.database.repository;

import io.openbas.database.model.InjectExpectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    // -- TECHNICAL --

    @Query(value = "select i from InjectExpectation i where i.inject.id = :injectId and i.asset.id = :assetId")
    InjectExpectation findTechnicalExpectationForAsset(@Param("injectId") String injectId, @Param("assetId") String assetId);

    @Query(value = "select i from InjectExpectation i where i.inject.id = :injectId and i.asset.id IN :assetIds")
    List<InjectExpectation> findTechnicalExpectationsForAssets(@Param("injectId") String injectId, @Param("assetIds") List<String> assetIds);

    @Query(value = "select i from InjectExpectation i where i.inject.id = :injectId and i.assetGroup.id IN :assetGroupId")
    InjectExpectation findTechnicalExpectationForAssetGroup(@Param("injectId") String injectId, @Param("assetGroupId") String assetGroupId);
}
