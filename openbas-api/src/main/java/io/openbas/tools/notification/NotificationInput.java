package io.openbas.tools.notification;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Filters;
import io.openbas.database.model.Notification;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NotificationInput {

  @JsonProperty("notification_name")
  @NotBlank
  private String name;

  @Column(name = "notification_filter")
  @JsonProperty("notification_filter")
  private Filters.FilterGroup filter;

  @JsonProperty("notification_outcomes")
  private List<String> outcomes;

  @JsonProperty("notification_event_types")
  private List<String> eventTypes;

  // -- METHOD --

  public Notification toNotification(@NotNull final Notification notification) {
    notification.setName(this.getName());
    notification.setFilter(this.getFilter());
    notification.setOutcomes(this.getOutcomes().toArray(String[]::new));
    notification.setEventTypes(this.getEventTypes().toArray(String[]::new));
    return notification;
  }

}
