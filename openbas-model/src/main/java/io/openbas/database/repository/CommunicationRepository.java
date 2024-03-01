package io.openbas.database.repository;

import io.openbas.database.model.Communication;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunicationRepository extends CrudRepository<Communication, String>, JpaSpecificationExecutor<Communication> {

    @NotNull
    Optional<Communication> findById(@NotNull String id);

    @Query("select c from Communication c join c.users as user where user.id = :userId order by c.receivedAt desc")
    List<Communication> findByUser(@Param("userId") String userId);

    boolean existsByIdentifier(String identifier);
}
