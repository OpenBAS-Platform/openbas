package io.openaev.database.repository;

import io.openaev.database.model.BaseInjectExpectation;
import io.openaev.database.model.ChallengeInjectExpectation;
import io.openaev.database.model.InjectExpectationResult;
import io.openaev.database.model.TechnicalInjectExpectation;
import io.openaev.database.raw.RawInjectExpectationIndexing;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface InjectExpectationResultRepository
    extends CrudRepository<InjectExpectationResult, String>,
        JpaSpecificationExecutor<InjectExpectationResult> { }
