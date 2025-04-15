package io.openbas.database.repository;

import io.openbas.database.model.NotificationRule;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRuleRepository
    extends CrudRepository<NotificationRule, String>, JpaSpecificationExecutor<NotificationRule> {

  @NotNull
  Optional<NotificationRule> findById(@NotNull String id);
}
