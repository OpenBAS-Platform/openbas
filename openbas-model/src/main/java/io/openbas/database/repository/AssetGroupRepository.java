package io.openbas.database.repository;

import io.openbas.database.model.AssetGroup;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import io.openbas.database.raw.RawAssetGroup;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AssetGroupRepository extends CrudRepository<AssetGroup, String>,
    StatisticRepository,
    JpaSpecificationExecutor<AssetGroup> {

  @Override
  @Query("select COUNT(DISTINCT ag) from Inject i " +
      "join i.assetGroups as ag " +
      "join i.exercise as e " +
      "join e.grants as grant " +
      "join grant.group.users as user " +
      "where user.id = :userId and i.createdAt < :creationDate")
  long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

  @Override
  @Query("select count(distinct ag) from AssetGroup ag where ag.createdAt < :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

  /**
   * Returns the raw asset group having the ids passed in parameter
   *
   * @param ids a list of ids
   * @return the list of raw asset group
   */
  @Query(value = "SELECT ag.asset_group_id, ag.asset_group_name,  " +
      "coalesce(array_agg(aga.asset_id) FILTER ( WHERE aga.asset_id IS NOT NULL ), '{}') asset_ids " +
      "FROM asset_groups ag " +
      "LEFT JOIN asset_groups_assets aga ON ag.asset_group_id = aga.asset_group_id " +
      "WHERE ag.asset_group_id IN :ids " +
      "GROUP BY ag.asset_group_id;", nativeQuery = true)
  List<RawAssetGroup> rawAssetGroupByIds(@Param("ids") List<String> ids);

  @Query(value =
      "SELECT ag.asset_group_id, ag.asset_group_name, CAST(ag.asset_group_dynamic_filter as text), " +
          "coalesce(array_agg(aga.asset_id) FILTER ( WHERE aga.asset_id IS NOT NULL ), '{}') asset_ids " +
          "FROM asset_groups ag " +
          "LEFT JOIN injects_asset_groups iat ON ag.asset_group_id = iat.asset_group_id " +
          "LEFT JOIN asset_groups_assets aga ON aga.asset_group_id = ag.asset_group_id " +
          "WHERE iat.asset_group_id IN (:assetGroupIds) OR iat.inject_id IN (:injectIds) " +
          "GROUP BY ag.asset_group_id, ag.asset_group_name, CAST(ag.asset_group_dynamic_filter as text) ;", nativeQuery = true)
  List<RawAssetGroup> rawByIdsOrInjectIds(@Param("assetGroupIds") List<String> assetGroupIds, @Param("injectIds") List<String> injectIds);

  // -- PAGINATION --

  @NotNull
  @EntityGraph(value = "AssetGroup.tags-assets", type = EntityGraph.EntityGraphType.LOAD)
  Page<AssetGroup> findAll(@NotNull Specification<AssetGroup> spec, @NotNull Pageable pageable);
}
