package io.openbas.service;

import io.openbas.database.model.Inject;
import lombok.Data;

import java.time.Instant;
import java.time.format.DateTimeFormatter;

@Data
public class InjectTime {
    private boolean isRelativeDay = false;
    private boolean isRelativeTime = false;
    private boolean specifyDays = true;
    private DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    private Instant date;
    private String unformattedDate;
    private int relativeDayNumber;
    private int relativeTimeNumber;
    private Inject linkedInject;
}
