package io.openex.database.repository;

import io.openex.database.model.System;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemRepository extends CrudRepository<System, String>  { }
