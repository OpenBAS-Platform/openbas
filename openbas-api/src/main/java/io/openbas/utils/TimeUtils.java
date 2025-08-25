package io.openbas.utils;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import static io.openbas.service.SecurityAssessmentService.ONE_SHOT;
import static java.time.ZoneOffset.UTC;

public class TimeUtils {

  public static Instant toInstant(@NotNull final String dateString) {
    String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(pattern, Locale.getDefault());
    LocalDateTime localDateTime = LocalDateTime.parse(dateString, dateTimeFormatter);
    ZonedDateTime zonedDateTime = localDateTime.atZone(UTC);
    return zonedDateTime.toInstant();
  }

  public static String getCronExpression(String scheduling, Instant start) {
    ZonedDateTime zdt = start.atZone(ZoneId.of("UTC"));
    int minute = zdt.getMinute();
    int hour = zdt.getHour();
    int dayOfMonth = zdt.getDayOfMonth();
    int dayOfWeek = zdt.getDayOfWeek().getValue();

    switch (scheduling) {
      case "d": // daily
        return String.format("0 %d %d * * *", minute, hour);
      case "w": // weekly
        return String.format("0 %d %d * * %d", minute, hour, dayOfWeek);
      case "m": // monthly
        return String.format("0 %d %d %d * *", minute, hour, dayOfMonth);
      case ONE_SHOT: // STIX is represented like X
        return null;
      default:
        throw new IllegalArgumentException("Unknown scheduling type: " + scheduling);
    }
  }
}
