package io.openbas.database.repository;

import io.openbas.database.model.NotificationRule;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRuleRepository
    extends CrudRepository<NotificationRule, String>, JpaSpecificationExecutor<NotificationRule> {

  @NotNull
  Optional<NotificationRule> findById(@NotNull String id);

  @Query("select nr from NotificationRule nr " + "where nr.resourceId = :resourceId")
  List<NotificationRule> findNotificationRuleByResource(@NotNull String resourceId);

  @Query(
      "select nr from NotificationRule nr "
          + "where nr.resourceId = :resourceId AND nr.owner.id = :userId")
  List<NotificationRule> findNotificationRuleByResourceAndUser(
      @NotBlank String resourceId, @NotBlank String userId);
}
