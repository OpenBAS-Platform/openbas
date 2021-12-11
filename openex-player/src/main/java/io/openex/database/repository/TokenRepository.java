package io.openex.database.repository;

import io.openex.database.model.Token;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRepository extends CrudRepository<Token, String> {

    Optional<Token> findById(String id);

    Optional<Token> findByValue(String value);
}
