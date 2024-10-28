package io.openbas.database.repository;

import io.openbas.database.model.Article;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository
    extends CrudRepository<Article, String>, JpaSpecificationExecutor<Article> {

  @NotNull
  Optional<Article> findById(@NotNull String id);
}
