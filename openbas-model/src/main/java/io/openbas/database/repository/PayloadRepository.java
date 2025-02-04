package io.openbas.database.repository;

import io.openbas.database.model.Payload;
import jakarta.validation.constraints.NotNull;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PayloadRepository
    extends CrudRepository<Payload, String>, JpaSpecificationExecutor<Payload> {
  @NotNull
  Optional<Payload> findById(@NotNull String id);

  @Query("select p from Payload p where p.type IN :types")
  List<Payload> findByType(@Param("types") final List<String> types);

  Optional<Payload> findByExternalId(@NotNull String externalId);

  List<Payload> findByExternalIdIn(Collection<String> externalIds);

  Optional<Payload> findByExternalIdAndVersion(@NotNull String externalId, @NotNull Integer version);

  @Query(
      value = "SELECT payload_external_id FROM payloads WHERE payload_collector = :collectorId",
      nativeQuery = true)
  List<String> findAllExternalIdsByCollectorId(@NotNull @Param("collectorId") String collectorId);

  @Modifying
  @Query(
      value =
          "UPDATE payloads SET payload_status = :payloadStatus WHERE payload_external_id IN :payloadExternalIds",
      nativeQuery = true)
  void setPayloadStatusByExternalIds(
      @Param("payloadStatus") String payloadStatus,
      @Param("payloadExternalIds") List<String> payloadExternalIds);
}
