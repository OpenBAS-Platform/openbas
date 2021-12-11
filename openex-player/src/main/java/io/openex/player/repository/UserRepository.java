package io.openex.player.repository;

import io.openex.player.model.database.User;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, String>, JpaSpecificationExecutor<User> {

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);
}
