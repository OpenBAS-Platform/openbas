package io.openex.player.repository;

import io.openex.player.model.database.Token;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRepository extends CrudRepository<Token, String> {

    Optional<Token> findById(String id);

    Optional<Token> findByValue(String value);
}
