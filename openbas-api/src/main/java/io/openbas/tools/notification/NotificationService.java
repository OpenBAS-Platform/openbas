package io.openbas.tools.notification;

import io.openbas.database.model.Filters;
import io.openbas.database.model.Filters.FilterGroup;
import io.openbas.database.model.Notification;
import io.openbas.database.model.User;
import io.openbas.database.repository.NotificationRepository;
import io.openbas.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.tools.notification.NotificationListener.ENTITY_ID_FILTER;

@Service
@RequiredArgsConstructor
public class NotificationService {

  public static final String NOTIFICATIONS_CACHE = "notifications";
  private final NotificationRepository notificationRepository;
  private final UserService userService;

  @Transactional
  @CacheEvict(value = NOTIFICATIONS_CACHE, allEntries = true)
  @CachePut(value = NOTIFICATIONS_CACHE, key = "#notification.id")
  public Notification createNotification(@NotNull final Notification notification) {
    notification.setUser(this.userService.currentUser());
    return notificationRepository.save(notification);
  }

  @Transactional(readOnly = true)
//  @Cacheable(value = NOTIFICATIONS_CACHE, key = "#id")
  public Notification notification(@NotNull final String id) {
    return this.notificationRepository
        .findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + id));
  }

  @Cacheable(NOTIFICATIONS_CACHE)
  @Transactional(readOnly = true)
  public List<Notification> notifications() {
    return fromIterable(notificationRepository.findAll()).stream().toList();
  }

  //  @Cacheable(NOTIFICATIONS_CACHE)
  @Transactional(readOnly = true)
  public List<Notification> notifications(final FilterGroup filterGroup) {
    User user = this.userService.currentUser();
    return fromIterable(notificationRepository.findAll())
        .stream()
        .filter(notification -> {
          Optional<Filters.Filter> notificationFilter = notification.getFilter()
              .getFilters()
              .stream()
              .filter(f -> f.getKey().equals(ENTITY_ID_FILTER))
              .findFirst();
          Optional<Filters.Filter> filter = filterGroup
              .getFilters()
              .stream()
              .filter(f -> f.getKey().equals(ENTITY_ID_FILTER))
              .findFirst();
          return notificationFilter.isPresent()
              && filter.isPresent()
              && notificationFilter.get().getValues().stream().anyMatch(v -> filter.get().getValues().contains(v))
              && notification.getUser().getId().equals(user.getId());
        })
        .toList();
  }

  //  @Transactional
//  @CachePut(value = NOTIFICATIONS_CACHE, key = "#notification.id")
  public Notification updateNotification(Notification notification) {
    if (!this.notificationRepository.existsById(notification.getId())) {
      throw new EntityNotFoundException("Notification not found with id: " + notification.getId());
    }
    return notificationRepository.save(notification);
  }

  //  @Transactional
//  @CacheEvict(value = NOTIFICATIONS_CACHE, key = "#id")
  public void deleteNotification(@NotNull final String id) {
    if (!this.notificationRepository.existsById(id)) {
      throw new EntityNotFoundException("Notification not found with id: " + id);
    }
    this.notificationRepository.deleteById(id);
  }

}
