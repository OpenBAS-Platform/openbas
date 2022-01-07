package io.openex.database.repository.basic;

import io.openex.database.model.basic.BasicInject;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BasicInjectRepository extends CrudRepository<BasicInject, String>, JpaSpecificationExecutor<BasicInject> {

    @NotNull
    Optional<BasicInject> findById(@NotNull String id);
}
