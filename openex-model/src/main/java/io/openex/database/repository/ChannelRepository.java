package io.openex.database.repository;

import io.openex.database.model.Channel;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelRepository extends CrudRepository<Channel, String>, JpaSpecificationExecutor<Channel> {

    @NotNull Optional<Channel> findById(@NotNull String id);

    List<Channel> findByNameIgnoreCase(String name);
}
