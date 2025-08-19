package io.openbas;

import static io.openbas.database.model.SettingKeys.PLATFORM_INSTANCE;
import static io.openbas.database.model.SettingKeys.PLATFORM_INSTANCE_CREATION;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Setting;
import io.openbas.database.repository.SettingRepository;
import io.openbas.tools.FlywayMigrationValidator;
import jakarta.annotation.PostConstruct;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
@RequiredArgsConstructor
public class App {

  private final SettingRepository settingRepository;
  private final OpenBASConfig openBASConfig;

  public static void main(String[] args) {
    FlywayMigrationValidator.validateFlywayMigrationNames();
    SpringApplication.run(App.class, args);
  }

  @PostConstruct
  public void init() {
    log.info("Startup init");
    // Get the platform instance id
    Optional<Setting> instanceId = this.settingRepository.findByKey(PLATFORM_INSTANCE.key());
    Setting instanceCreationDate =
        this.settingRepository
            .findByKey(PLATFORM_INSTANCE_CREATION.key())
            .orElse(new Setting(PLATFORM_INSTANCE_CREATION.key(), ""));

    // If we don't have a platform instance id or if it's been specified as another value than the
    // one in the database
    if (instanceId.isEmpty()
        || (openBASConfig.getInstanceId() != null
            && !instanceId.get().getValue().equals(openBASConfig.getInstanceId()))) {
      log.info("Updating platform instance id");
      // We update the platform instance id using a random UUID if the value does not exist in the
      // database
      Setting instanceIdSetting =
          instanceId.orElse(new Setting(PLATFORM_INSTANCE.key(), UUID.randomUUID().toString()));

      // If it's been specified as a specific id, we validate that it's a proper UUID and use it
      if (!Strings.isBlank(openBASConfig.getInstanceId())) {
        instanceIdSetting.setValue(UUID.fromString(openBASConfig.getInstanceId()).toString());
      }

      // Then we save the id in database and update/set the creation date
      settingRepository.save(instanceIdSetting);
      instanceCreationDate.setValue(Timestamp.from(Instant.now()).toString());
      settingRepository.save(instanceCreationDate);
    }
  }
}
