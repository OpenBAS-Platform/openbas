package io.openex.database.repository;

import io.openex.database.model.Setting;
import javax.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingRepository extends CrudRepository<Setting, String>, JpaSpecificationExecutor<Setting> {

    @NotNull
    Optional<Setting> findById(@NotNull String id);

    Optional<Setting> findByKey(String key);

    @Query(value = "SHOW server_version", nativeQuery = true)
    String getServerVersion();
}
