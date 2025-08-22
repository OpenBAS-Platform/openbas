package io.openbas.service.utils;

import com.cronutils.model.CronType;
import com.cronutils.model.definition.CronDefinitionBuilder;
import com.cronutils.model.time.ExecutionTime;
import com.cronutils.parser.CronParser;
import java.time.Instant;
import java.time.ZoneId;
import java.time.chrono.ChronoZonedDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class CronService {
  public Optional<Instant> getNextExecutionFromInstant(
      Instant reference, ZoneId tz, String cronExpression) {
    if (cronExpression == null || cronExpression.isBlank()) {
      return Optional.empty();
    }
    return ExecutionTime.forCron(
            new CronParser(CronDefinitionBuilder.instanceDefinitionFor(CronType.SPRING53))
                .parse(cronExpression))
        .nextExecution(reference.atZone(tz))
        .map(ChronoZonedDateTime::toInstant);
  }
}
