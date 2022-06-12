package io.openex.database.repository;

import io.openex.database.model.Media;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface MediaRepository extends CrudRepository<Media, String>, JpaSpecificationExecutor<Media> {

    @NotNull
    Optional<Media> findById(@NotNull String id);
}
