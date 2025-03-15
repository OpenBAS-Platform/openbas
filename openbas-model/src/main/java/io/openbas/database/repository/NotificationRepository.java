package io.openbas.database.repository;

import io.openbas.database.model.Notification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository
    extends CrudRepository<Notification, String>, JpaSpecificationExecutor<Notification> {

}
