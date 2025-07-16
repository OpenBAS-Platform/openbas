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

  public List<Class<?>> exclusionList =
      List.of(
          UserRepository.class,
          SettingRepository.class,
          GroupRepository.class,
          InjectorContractRepository.class,
          InjectorRepository.class);

  public void globalTeardown() {
    log.info("Global teardown");

    Field[] fields = this.getClass().getDeclaredFields();
    int numberOfPass = 0;
    boolean needAnotherPass = false;
    do {
      for (Field repository : fields) {
        try {
          repository.setAccessible(true);
          if (repository.get(this) instanceof CrudRepository) {
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
            if (!isExcluded) {
              try {
                ((CrudRepository) repository.get(this)).deleteAll();
                log.info("Deleted all records on {}", repository.getName());
              } catch (DataIntegrityViolationException e) {
                needAnotherPass = true;
              }
            } else if (Arrays.asList(repository.get(this).getClass().getInterfaces())
                .contains(UserRepository.class)) {

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
  }
}
