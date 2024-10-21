package io.openbas.database.repository;

import io.openbas.database.model.Tag;
import java.util.List;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends CrudRepository<Tag, String>, JpaSpecificationExecutor<Tag> {

  @NotNull
  Optional<Tag> findById(@NotNull String id);

  @NotNull
  Optional<Tag> findByName(@NotNull final String name);

  @NotNull
  List<Tag> findByNameIgnoreCase(@NotNull final String name);
}
