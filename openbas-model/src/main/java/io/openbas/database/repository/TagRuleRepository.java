package io.openbas.database.repository;

import io.openbas.database.model.TagRule;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRuleRepository extends CrudRepository<TagRule, String>, JpaSpecificationExecutor<TagRule> {

    @NotNull
    Optional<TagRule> findById(@NotNull String id);
}