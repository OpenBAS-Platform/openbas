package io.openbas.database.repository;

import io.openbas.database.model.Grant;
import io.openbas.database.raw.RawGrant;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantRepository
    extends CrudRepository<Grant, String>, JpaSpecificationExecutor<Grant> {

  @NotNull
  Optional<Grant> findById(@NotNull String id);

  @Query(
      value =
          "SELECT users_groups.user_id, grants.grant_name, grants.grant_id "
              + "FROM grants "
              + "LEFT JOIN groups ON grants.grant_group = groups.group_id "
              + "LEFT JOIN users_groups ON groups.group_id = grants.grant_group "
              + "WHERE grants.grant_exercise IN :ids ;",
      nativeQuery = true)
  List<RawGrant> rawByExerciseIds(@Param("ids") List<String> ids);
}
