package io.openbas.database.repository;

import io.openbas.database.model.Asset;
import io.openbas.database.raw.RawAsset;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends CrudRepository<Asset, String>, JpaSpecificationExecutor<Asset> {

  @Query("select a from Asset a where a.type IN :types")
  List<Asset> findByType(@Param("types") final List<String> types);

  /**
   * Returns the raw assets having the ids passed in parameter
   *
   * @param ids the ids
   * @return the list of raw assets
   */
  @Query(value = "SELECT asset_id, asset_name, asset_type, endpoint_platform " +
      "FROM assets " +
      "WHERE asset_id IN :ids ;", nativeQuery = true)
  List<RawAsset> rawByIds(@Param("ids") List<String> ids);

  @Query(value = "SELECT DISTINCT (a.asset_id, a.asset_name, a.asset_type, a.endpoint_platform) " +
      "FROM assets a " +
      "LEFT JOIN injects_assets ia ON a.asset_id = ia.asset_id " +
      "WHERE ia.asset_id IN (:assetIds) OR ia.inject_id IN (:injectIds) ;", nativeQuery = true)
  List<RawAsset> rawByIdsOrInjectIds(@Param("assetIds") List<String> assetIds, @Param("injectIds") List<String> injectIds);
}

