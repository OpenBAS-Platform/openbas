package io.openbas;

import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.injectors.email.EmailContract.EMAIL_GLOBAL;
import static io.openbas.injectors.manual.ManualContract.MANUAL_DEFAULT;

import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.User;
import io.openbas.database.repository.*;
import io.openbas.utils.fixtures.composers.ComposerBase;
import io.openbas.utils.fixtures.composers.InnerComposerBase;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.StreamSupport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.repository.CrudRepository;

@AutoConfigureMockMvc(print = MockMvcPrint.SYSTEM_ERR)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Slf4j
public abstract class IntegrationTest {

  @Value("${openbas.admin.email:#{null}}")
  private String adminEmail;

  private final List<String> WELL_KNOWN_CONTRACT_IDS =
      List.of(CHALLENGE_PUBLISH, CHANNEL_PUBLISH, EMAIL_DEFAULT, EMAIL_GLOBAL, MANUAL_DEFAULT);

  /** List of classes we don't auto delete all to prevent the platform from breaking */
  public List<Class<?>> exclusionList =
      List.of(
          UserRepository.class,
          SettingRepository.class,
          GroupRepository.class,
          InjectorContractRepository.class,
          InjectorRepository.class,
          GrantRepository.class);

  /**
   * Utilitarian method that use reflection to list all the CrudRepository implementation in the
   * test and do a deleteAll on all of them except the excluded ones (see exclusionList).
   */
  public void globalTeardown() {
    log.info("Global teardown");

    // List all the declared fields
    Field[] fields = this.getClass().getDeclaredFields();

    List<Field> repositoryFields = new ArrayList<>();
    List<Field> composerFields = new ArrayList<>();

    // Using multiple pass as it can happen that we try to delete data with foreign keys
    try {
      // For each of the fields
      for (Field repository : fields) {
        repository.setAccessible(true);
        // If we are an instance of CrudRepository
        if (repository.get(this) instanceof CrudRepository) {
          repositoryFields.add(repository);
        } else if (repository.get(this) instanceof ComposerBase) {
          composerFields.add(repository);
        }
      }

      for (Field composerField : composerFields) {
        ((ComposerBase<?>) composerField.get(this))
            .generatedComposer.forEach(
                composer -> {
                  try {
                    ((InnerComposerBase<?>) composer).delete();
                  } catch (Exception e) {
                    log.info("Entity not found");
                  }
                });
      }
      int numberOfPass = 0;
      boolean needAnotherPass = false;
      do {

        for (Field repository : repositoryFields) {
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
            } catch (Exception e) {
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
          } else if (Arrays.asList(repository.get(this).getClass().getInterfaces())
              .contains(InjectorContractRepository.class)) {
            // For InjectorContractRepository, we still delete all the injector contract but the
            // known ones
            List<InjectorContract> injectorContracts =
                StreamSupport.stream(
                        ((InjectorContractRepository) repository.get(this)).findAll().spliterator(),
                        false)
                    .toList();
            for (InjectorContract injectorContract : injectorContracts) {
              if (!WELL_KNOWN_CONTRACT_IDS.contains(injectorContract.getId())) {
                ((InjectorContractRepository) repository.get(this)).delete(injectorContract);
              }
            }
          }
        }
        numberOfPass += 1;
      } while (numberOfPass < 5 && needAnotherPass);

      if (numberOfPass == 5) {
        log.error("There was an issue with foreign keys");
      }
    } catch (IllegalAccessException e) {
      log.error("Cannot access", e);
    }
  }
}
