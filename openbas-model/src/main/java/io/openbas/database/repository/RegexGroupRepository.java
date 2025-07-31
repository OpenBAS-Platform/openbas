package io.openbas.database.repository;

import io.openbas.database.model.RegexGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RegexGroupRepository
    extends JpaRepository<RegexGroup, String>, JpaSpecificationExecutor<RegexGroup> {}
