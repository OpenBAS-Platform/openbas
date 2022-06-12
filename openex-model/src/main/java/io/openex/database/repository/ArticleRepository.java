package io.openex.database.repository;

import io.openex.database.model.MediaArticle;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface ArticleRepository extends CrudRepository<MediaArticle, String>, JpaSpecificationExecutor<MediaArticle> {

    @NotNull
    Optional<MediaArticle> findById(@NotNull String id);
}
