package io.openex.database.repository;

import org.springframework.data.repository.query.Param;

import java.util.Date;

public interface StatisticRepository {

    long globalCount(@Param("creationDate") Date creationDate);

    long userCount(@Param("userId") String userId, @Param("creationDate") Date creationDate);
}
