package io.openex.database.repository;

import io.openex.database.model.User;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, String>, JpaSpecificationExecutor<User>, StatisticRepository {

    @NotNull
    Optional<User> findById(@NotNull String id);

    Optional<User> findByEmail(String email);

    List<User> findAllByEmailIn(List<String> emails);

    @Override
    @Query("select count(distinct u) from User u " +
            "join u.audiences as audience " +
            "join audience.exercise as e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId and u.createdAt < :creationDate")
    long userCount(String userId, Instant creationDate);

    @Override
    @Query("select count(distinct u) from User u where u.createdAt < :creationDate")
    long globalCount(Instant creationDate);
}
