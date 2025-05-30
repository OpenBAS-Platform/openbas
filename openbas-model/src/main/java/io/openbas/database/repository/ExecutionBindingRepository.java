package io.openbas.database.repository;

import io.openbas.database.model.ExecutionBinding;
import io.openbas.database.model.InjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutionBindingRepository extends JpaRepository<ExecutionBinding, String> {

  List<ExecutionBinding> findByExecution(InjectStatus execution);
}
