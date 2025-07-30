package io.openbas.database.repository;

import io.openbas.database.model.ContractOutputElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractOutputElementRepository
    extends JpaRepository<ContractOutputElement, String>,
        JpaSpecificationExecutor<ContractOutputElement> {}
