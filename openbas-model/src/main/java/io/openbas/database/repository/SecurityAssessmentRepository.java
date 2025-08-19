package io.openbas.database.repository;

@Repository
public interface SecurityAssessmentRepository
    extends CrudRepository<SecurityAssessment, String>,
    JpaSpecificationExecutor<SecurityAssessment> {

  Optional<SecurityAssessment> findByExternalId(String id);
}