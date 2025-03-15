package io.openbas.tools.notification;

import io.openbas.database.model.Filters.FilterGroup;
import io.openbas.database.model.Notification;
import io.openbas.rest.helper.RestBehavior;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationApi extends RestBehavior {

  private final NotificationService notificationService;

  // -- CRUD --

  @PostMapping
  public ResponseEntity<Notification> createNotification(
      @RequestBody @Valid @NotNull final NotificationInput input) {
    return ResponseEntity.ok(
        this.notificationService.createNotification(input.toNotification(new Notification())));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Notification> notification(@PathVariable @NotNull final String id) {
    return ResponseEntity.ok(this.notificationService.notification(id));
  }

  @PostMapping("/filters")
  public ResponseEntity<List<Notification>> notifications(@RequestBody @Valid final FilterGroup filterGroup) {
    return ResponseEntity.ok(this.notificationService.notifications(filterGroup));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Notification> updateNotification(
      @PathVariable @NotNull final String id,
      @RequestBody @Valid @NotNull final NotificationInput input) {
    Notification existingNotification = this.notificationService.notification(id);
    Notification updatedNotification = input.toNotification(existingNotification);
    return ResponseEntity.ok(
        this.notificationService.updateNotification(updatedNotification));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteNotification(@PathVariable @NotNull final String id) {
    this.notificationService.deleteNotification(id);
    return ResponseEntity.noContent().build();
  }

}
