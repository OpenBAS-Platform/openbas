package io.openbas.database.repository;

import io.openbas.database.model.Asset;
import io.openbas.database.raw.RawAsset;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository
    extends CrudRepository<Asset, String>, JpaSpecificationExecutor<Asset> {

  @Query("select a from Asset a where a.type IN :types")
  List<Asset> findByType(@Param("types") final List<String> types);

  /**
   * Returns the raw assets having the ids passed in parameter
   *
   * @param ids the ids
   * @return the list of raw assets
   */
  @Query(
      value =
          "SELECT asset_id, asset_name, asset_type, endpoint_platform, "
              + "asset_created_at, asset_updated_at "
              + "FROM assets "
              + "WHERE asset_id IN :ids ;",
      nativeQuery = true)
  List<RawAsset> rawByIds(@Param("ids") List<String> ids);

  @Query(
      value =
          "SELECT DISTINCT a.asset_id, a.asset_name, a.asset_type, a.endpoint_platform, "
              + "a.asset_created_at, a.asset_updated_at "
              + "FROM assets a "
              + "LEFT JOIN injects_assets ia ON a.asset_id = ia.asset_id "
              + "WHERE a.asset_id IN (:assetIds) OR ia.inject_id IN (:injectIds) ;",
      nativeQuery = true)
  List<RawAsset> rawByIdsOrInjectIds(
      @Param("assetIds") Set<String> assetIds, @Param("injectIds") Set<String> injectIds);

  @Query(
      value =
          "SELECT DISTINCT i.inject_exercise, a.asset_id, a.asset_name "
              + "FROM assets a "
              + "INNER JOIN injects_assets ia ON a.asset_id = ia.asset_id "
              + "INNER JOIN injects i ON ia.inject_id = i.inject_id "
              + "WHERE i.inject_exercise in :exerciseIds",
      nativeQuery = true)
  List<Object[]> assetsByExerciseIds(Set<String> exerciseIds);

  @Query(
      value =
          "SELECT DISTINCT ia.inject_id, a.asset_id, a.asset_name "
              + "FROM assets a "
              + "INNER JOIN injects_assets ia ON a.asset_id = ia.asset_id "
              + "WHERE ia.inject_id in :injectIds",
      nativeQuery = true)
  List<Object[]> assetsByInjectIds(Set<String> injectIds);

  @Query(
      value =
          "SELECT "
              // ASSET GENERIC FIELDS
              + "a.asset_id, a.asset_type, a.asset_name, "
              + "a.asset_description, a.asset_created_at, a.asset_updated_at, a.asset_external_reference, "
              // ENDPOINT FIELDS
              + "a.endpoint_ips, a.endpoint_hostname, a.endpoint_platform, a.endpoint_arch, a.endpoint_seen_ip, "
              + "a.endpoint_mac_addresses,"
              // SECURITY PLATFORM FIELDS
              + "a.security_platform_type, a.security_platform_logo_light, a.security_platform_logo_dark, "
              // relations
              + "fa.finding_id, at.tag_id "
              + "FROM assets a "
              + "LEFT JOIN findings_assets fa ON a.asset_id = fa.asset_id "
              + "LEFT JOIN assets_tags at ON a.asset_id = at.asset_id "
              + "WHERE a.asset_updated_at > :from ORDER BY a.asset_updated_at LIMIT 500;",
      nativeQuery = true)
  List<RawAsset> findForIndexing(@Param("from") Instant from);
}
