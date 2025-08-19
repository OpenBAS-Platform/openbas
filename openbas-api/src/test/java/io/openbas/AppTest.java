package io.openbas;

import static io.openbas.database.model.SettingKeys.PLATFORM_INSTANCE;
import static org.junit.jupiter.api.Assertions.*;

import io.openbas.database.repository.SettingRepository;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

class AppTest extends IntegrationTest {

  @Autowired private SettingRepository settingRepository;
  private static String previousServerPort;

  @BeforeAll
  static void setup() {
    // Setting another port we're going to launch new instances of the application
    previousServerPort = System.getProperty("server.port");
    System.setProperty("server.port", "8089");
  }

  @AfterAll
  static void cleanup() {
    // Changing back the port to the previous value
    if (previousServerPort != null) {
      System.setProperty("server.port", previousServerPort);
    } else {
      System.clearProperty("server.port");
    }
    // Removing the property for the instance id
    System.clearProperty("openbas.instance-id");
  }

  @DisplayName("Should throw an exception when having an incorrect instance id")
  @Test
  void shouldThrowExceptionWithInvalidInstanceId() {
    System.setProperty("openbas.instance-id", "pouet");
    settingRepository
        .findByKey(PLATFORM_INSTANCE.key())
        .ifPresent(setting -> settingRepository.delete(setting));
    ConfigurableApplicationContext context = null;
    try {
      context = SpringApplication.run(App.class);
    } catch (Exception e) {
      assertEquals("Invalid UUID string: pouet", e.getCause().getMessage());
      return;
    } finally {
      if (context != null) {
        context.close();
      }
    }
    fail();
  }

  @DisplayName("Should update the instance id with the one in the properties")
  @Test
  void shouldUpdateInstanceIdWithProperty() {
    String uuid = UUID.randomUUID().toString();
    System.setProperty("openbas.instance-id", uuid);
    ConfigurableApplicationContext context = SpringApplication.run(App.class);
    assertTrue(settingRepository.findByKey(PLATFORM_INSTANCE.key()).isPresent());
    assertEquals(uuid, settingRepository.findByKey(PLATFORM_INSTANCE.key()).get().getValue());
    context.close();
  }

  @DisplayName("Should update the instance id when there is none in db")
  @Test
  void shouldUpdateInstanceIdWhenNoneInDb() {
    settingRepository
        .findByKey(PLATFORM_INSTANCE.key())
        .ifPresent(setting -> settingRepository.delete(setting));
    ConfigurableApplicationContext context = SpringApplication.run(App.class);
    assertTrue(settingRepository.findByKey(PLATFORM_INSTANCE.key()).isPresent());
    assertNotNull(settingRepository.findByKey(PLATFORM_INSTANCE.key()).get().getValue());
    context.close();
  }

  @DisplayName(
      "Should update the instance id when there is none in db and the specified one is blank")
  @Test
  void shouldUpdateInstanceIdWhenNoneInDbAndSpecifiedOneIsBlank() {
    System.setProperty("openbas.instance-id", "");
    settingRepository
        .findByKey(PLATFORM_INSTANCE.key())
        .ifPresent(setting -> settingRepository.delete(setting));
    ConfigurableApplicationContext context = SpringApplication.run(App.class);
    assertTrue(settingRepository.findByKey(PLATFORM_INSTANCE.key()).isPresent());
    assertNotNull(settingRepository.findByKey(PLATFORM_INSTANCE.key()).get().getValue());
    context.close();
  }
}
