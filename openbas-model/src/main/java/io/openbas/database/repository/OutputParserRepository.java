package io.openbas.database.repository;

import io.openbas.database.model.OutputParser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface OutputParserRepository
    extends JpaRepository<OutputParser, String>, JpaSpecificationExecutor<OutputParser> {}
