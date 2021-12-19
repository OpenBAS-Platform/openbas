package io.openex.database.repository;

import io.openex.database.model.User;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, String>, JpaSpecificationExecutor<User> {

    @NotNull
    Optional<User> findById(@NotNull String id);

    Optional<User> findByEmail(String email);
}
