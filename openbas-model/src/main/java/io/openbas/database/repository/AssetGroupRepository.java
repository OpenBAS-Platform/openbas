package io.openbas.database.repository;

import io.openbas.database.model.AssetGroup;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

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

  // -- PAGINATION --

  @NotNull
  @EntityGraph(value = "AssetGroup.tags-assets", type = EntityGraph.EntityGraphType.LOAD)
  Page<AssetGroup> findAll(@NotNull Specification<AssetGroup> spec, @NotNull Pageable pageable);
}
