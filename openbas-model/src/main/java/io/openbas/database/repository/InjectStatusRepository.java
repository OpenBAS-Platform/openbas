package io.openbas.database.repository;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectStatusRepository
    extends CrudRepository<InjectStatus, String>, JpaSpecificationExecutor<InjectStatus> {

  @NotNull
  Optional<InjectStatus> findById(@NotNull String id);

  @Query(
      value =
          "select c from InjectStatus c where c.name = 'PENDING' and c.inject.injectorContract.injector.type = :injectType")
  List<InjectStatus> pendingForInjectType(@Param("injectType") String injectType);

  Optional<InjectStatus> findByInject(@NotNull Inject inject);
}
