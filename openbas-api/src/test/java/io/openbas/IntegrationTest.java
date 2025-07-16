package io.openbas;

import io.openbas.database.model.User;
import io.openbas.database.repository.*;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.repository.CrudRepository;

@AutoConfigureMockMvc(print = MockMvcPrint.SYSTEM_ERR)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Slf4j
public abstract class IntegrationTest {

  @Value("${openbas.admin.email:#{null}}")
  private String adminEmail;

  /** List of classes we don't auto delete all to prevent the platform from breaking */
  public List<Class<?>> exclusionList =
      List.of(
          UserRepository.class,
          SettingRepository.class,
          GroupRepository.class,
          InjectorContractRepository.class,
          InjectorRepository.class);

  /**
   * Utilitarian method that use reflection to list all the CrudRepository implementation in the
   * test and do a deleteAll on all of them except the excluded ones (see exclusionList).
   */
  public void globalTeardown() {
    log.info("Global teardown");

    // List all the declared fields
    Field[] fields = this.getClass().getDeclaredFields();

    // Using multiple pass as it can happen that we try to delete data with foreign keys
    int numberOfPass = 0;
    boolean needAnotherPass = false;
    do {
      // For each of the fields
      for (Field repository : fields) {
        try {
          repository.setAccessible(true);
          // If we are an instance of CrudRepository
          if (repository.get(this) instanceof CrudRepository) {
            // Checking if the field is part of the excluded list
            boolean isExcluded =
                exclusionList.stream()
                    .anyMatch(
                        aClass -> {
                          try {
                            return Arrays.asList(repository.get(this).getClass().getInterfaces())
                                .contains(aClass);
                          } catch (IllegalAccessException e) {
                            throw new RuntimeException(e);
                          }
                        });
            // If it isn't excluded, we do a deleteAll
            if (!isExcluded) {
              try {
                ((CrudRepository) repository.get(this)).deleteAll();
                log.info("Deleted all records on {}", repository.getName());
              } catch (DataIntegrityViolationException e) {
                // If there is an issue with foreign keys, we'll do another pass
                needAnotherPass = true;
              }
            } else if (Arrays.asList(repository.get(this).getClass().getInterfaces())
                .contains(UserRepository.class)) {
              // For userRepository, we still delete all the users but the admin one
              List<User> users = ((UserRepository) repository.get(this)).findAll();
              for (User user : users) {
                if (!user.getEmail().equals(adminEmail)) {
                  ((UserRepository) repository.get(this)).delete(user);
                }
              }
            }
          }
        } catch (IllegalAccessException e) {
          log.error("Cannot access", e);
        }
      }
      numberOfPass += 1;
    } while (numberOfPass < 5 && needAnotherPass);

    if (numberOfPass == 5) {
      log.error("There was an issue with foreign keys");
    }
  }
}
