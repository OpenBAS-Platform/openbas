package io.openbas.database.repository;

import io.openbas.database.model.Document;
import io.openbas.database.model.SecurityPlatform;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityPlatformRepository
    extends CrudRepository<SecurityPlatform, String>,
        StatisticRepository,
        JpaSpecificationExecutor<SecurityPlatform> {

  Optional<SecurityPlatform> findByExternalReference(
      @Param("externalReference") String externalReference);

  @Override
  @Query(
      "select COUNT(DISTINCT a) from Inject i "
          + "join i.assets as a "
          + "join i.exercise as e "
          + "join e.grants as grant "
          + "join grant.group.users as user "
          + "where user.id = :userId and i.createdAt < :creationDate")
  long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

  @Override
  @Query("select count(distinct s) from SecurityPlatform s where s.createdAt < :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

  @Query(
      "select distinct s.logoDark from SecurityPlatform s "
          + "union "
          + "select distinct s.logoLight from SecurityPlatform s ")
  List<Document> securityPlatformLogo();
}
