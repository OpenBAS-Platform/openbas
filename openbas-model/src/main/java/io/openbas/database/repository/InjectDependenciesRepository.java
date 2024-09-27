package io.openbas.database.repository;

import io.openbas.database.model.InjectDependency;
import io.openbas.database.model.InjectDependencyId;
import io.openbas.database.model.Injector;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InjectDependenciesRepository extends CrudRepository<InjectDependency, InjectDependencyId>, JpaSpecificationExecutor<Injector> {

    @Query(value = "SELECT " +
            "inject_parent_id, " +
            "inject_children_id, " +
            "dependency_condition, " +
            "dependency_created_at, " +
            "dependency_updated_at " +
            "FROM injects_dependencies " +
            "WHERE inject_children_id IN :childrens", nativeQuery = true)
    List<InjectDependency> findParents(@NotNull List<String> childrens);

    @Query(value = "SELECT " +
            "inject_parent_id, " +
            "inject_children_id, " +
            "dependency_condition, " +
            "dependency_created_at, " +
            "dependency_updated_at " +
            "FROM injects_dependencies " +
            "WHERE inject_parent_id IN :parents", nativeQuery = true)
    List<InjectDependency> findChildrens(@NotNull List<String> parents);
}
