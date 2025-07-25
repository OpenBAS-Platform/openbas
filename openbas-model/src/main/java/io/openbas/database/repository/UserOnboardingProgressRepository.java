package io.openbas.database.repository;

import io.openbas.database.model.UserOnboardingProgress;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UserOnboardingProgressRepository
    extends JpaRepository<UserOnboardingProgress, UUID>,
        JpaSpecificationExecutor<UserOnboardingProgress> {}
