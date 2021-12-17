package io.openex.database.repository;

import io.openex.database.model.Token;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRepository extends CrudRepository<Token, String> {

    @NotNull
    Optional<Token> findById(@NotNull String id);

    Optional<Token> findByValue(String value);
}
