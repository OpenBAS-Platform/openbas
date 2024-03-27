package io.openbas.database.repository;

import io.openbas.database.model.AssetGroup;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetGroupRepository extends CrudRepository<AssetGroup, String> {

}
