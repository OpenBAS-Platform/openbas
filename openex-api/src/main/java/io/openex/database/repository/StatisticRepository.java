package io.openex.database.repository;

import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface StatisticRepository {

    long globalCount(@Param("creationDate") Instant creationDate);

    long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);
}
