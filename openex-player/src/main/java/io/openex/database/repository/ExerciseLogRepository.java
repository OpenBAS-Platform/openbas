package io.openex.database.repository;

import io.openex.database.model.ExerciseLog;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExerciseLogRepository extends CrudRepository<ExerciseLog, String>, JpaSpecificationExecutor<ExerciseLog> {

    Optional<ExerciseLog> findById(String id);
}
