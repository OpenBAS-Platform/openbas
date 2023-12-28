package io.openex.database.repository;

import io.openex.database.model.AssetGroup;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetGroupRepository extends CrudRepository<AssetGroup, String> {

}
