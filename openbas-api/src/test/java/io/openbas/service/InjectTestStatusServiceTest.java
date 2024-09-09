package io.openbas.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.config.OpenBASOidcUser;
import io.openbas.database.model.*;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.injectors.channel.model.ChannelContent;
import io.openbas.injectors.email.model.EmailContent;
import io.openbas.utils.fixtures.PaginationFixture;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


import java.util.Collections;
import java.util.List;

import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class InjectTestStatusServiceTest {

  @Autowired
  private InjectRepository injectRepository;

  @Autowired
  private ExerciseRepository exerciseRepository;

  @Autowired
  private InjectorContractRepository injectorContractRepository;

  @Autowired
  private InjectTestStatusService injectTestStatusService;

  @Autowired
  private UserRepository userRepository;

  @Resource
  protected ObjectMapper mapper;

  private Inject INJECT1;
  private Inject INJECT2;
  private Inject INJECT3;
  private Exercise EXERCISE;


  @BeforeAll
  void beforeAll() {
    Exercise exercise = new Exercise();
    exercise.setName("Exercice name");
    exercise.setFrom("test@test.com");
    exercise.setReplyTos(List.of("test@test.com"));
    EXERCISE = this.exerciseRepository.save(exercise);

    Inject inject = new Inject();
    inject.setTitle("test");
    inject.setInjectorContract(this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
    inject.setExercise(EXERCISE);
    inject.setDependsDuration(0L);
    EmailContent content = new EmailContent();
    content.setSubject("Subject email");
    content.setBody("A body");
    inject.setContent(this.mapper.valueToTree(content));
    INJECT1 = this.injectRepository.save(inject);

    Inject inject2 = new Inject();
    inject2.setTitle("test2");
    inject2.setInjectorContract(this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
    inject2.setExercise(EXERCISE);
    inject2.setDependsDuration(0L);
    EmailContent content2 = new EmailContent();
    content2.setSubject("Subject email");
    content2.setBody("A body");
    inject2.setContent(this.mapper.valueToTree(content2));
    INJECT2 = this.injectRepository.save(inject2);

    Inject inject3 = new Inject();
    inject3.setTitle("test3");
    inject3.setInjectorContract(this.injectorContractRepository.findById(CHANNEL_PUBLISH).orElseThrow());
    inject3.setExercise(EXERCISE);
    inject3.setDependsDuration(0L);
    ChannelContent content3 = new ChannelContent();
    content3.setSubject("Subject email");
    content3.setBody("A body");
    inject3.setContent(this.mapper.valueToTree(content3));
    INJECT3 = this.injectRepository.save(inject3);
  }

  @AfterAll
  void afterAll() {
    this.injectRepository.delete(INJECT1);
    this.injectRepository.delete(INJECT2);
    this.injectRepository.delete(INJECT3);
    this.exerciseRepository.delete(EXERCISE);
  }

  @DisplayName("Test an email inject")
  @Test
  void testInject() {
    // Mock the UserDetails with a custom ID
    User user = this.userRepository.findByEmailIgnoreCase("admin@openbas.io").orElseThrow();
    OpenBASOidcUser oidcUser = new OpenBASOidcUser(user);
    Authentication auth = new UsernamePasswordAuthenticationToken(oidcUser, "password", Collections.EMPTY_LIST);
    SecurityContextHolder.getContext().setAuthentication(auth);

    // -- EXECUTE --
    InjectTestStatus test = injectTestStatusService.testInject(INJECT1.getId());
    assertNotNull(test);

    // -- CLEAN --
    this.injectTestStatusService.deleteInjectTest(test.getId());
  }

  @DisplayName("Test a channel inject")
  @Test
  void testNonMailInject() {
    // Mock the UserDetails with a custom ID
    User user = this.userRepository.findByEmailIgnoreCase("admin@openbas.io").orElseThrow();
    OpenBASOidcUser oidcUser = new OpenBASOidcUser(user);
    Authentication auth = new UsernamePasswordAuthenticationToken(oidcUser, "password", Collections.EMPTY_LIST);
    SecurityContextHolder.getContext().setAuthentication(auth);

    // -- EXECUTE --
    Exception exception = assertThrows(IllegalArgumentException.class, () -> {
      injectTestStatusService.testInject(INJECT3.getId());
    });

    String expectedMessage = "Inject: " + INJECT3.getId() + " is not testable";
    String actualMessage = exception.getMessage();
    assertTrue(actualMessage.contains(expectedMessage));

    // -- CLEAN --
    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault()
        .size(1110)
        .build();
    Page<InjectTestStatus> tests = injectTestStatusService.findAllInjectTestsByExerciseId(EXERCISE.getId(),
        searchPaginationInput);
    tests.stream().forEach(test -> this.injectTestStatusService.deleteInjectTest(test.getId()));
  }

  @DisplayName("Test multiple injects")
  @Test
  void testBulkInject() {
    // Mock the UserDetails with a custom ID
    User user = this.userRepository.findByEmailIgnoreCase("admin@openbas.io").orElseThrow();
    OpenBASOidcUser oidcUser = new OpenBASOidcUser(user);
    Authentication auth = new UsernamePasswordAuthenticationToken(oidcUser, "password", Collections.EMPTY_LIST);
    SecurityContextHolder.getContext().setAuthentication(auth);

    // -- EXECUTE --
    List<InjectTestStatus> tests = injectTestStatusService.bulkTestInjects(List.of(INJECT1.getId(), INJECT2.getId()));
    assertEquals(2, tests.size());

    // -- CLEAN --
    tests.forEach(test -> this.injectTestStatusService.deleteInjectTest(test.getId()));
  }

  @DisplayName("Bulk test with non testable injects")
  @Test
  void bulkTestNonMailInject() {
    // Mock the UserDetails with a custom ID
    User user = this.userRepository.findByEmailIgnoreCase("admin@openbas.io").orElseThrow();
    OpenBASOidcUser oidcUser = new OpenBASOidcUser(user);
    Authentication auth = new UsernamePasswordAuthenticationToken(oidcUser, "password", Collections.EMPTY_LIST);
    SecurityContextHolder.getContext().setAuthentication(auth);

    // -- EXECUTE --
    Exception exception = assertThrows(IllegalArgumentException.class, () -> {
      injectTestStatusService.bulkTestInjects(Collections.singletonList(INJECT3.getId()));
    });

    String expectedMessage = "No inject ID is testable";
    String actualMessage = exception.getMessage();
    assertTrue(actualMessage.contains(expectedMessage));

    // -- CLEAN --
    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault()
        .size(1110)
        .build();
    Page<InjectTestStatus> tests = injectTestStatusService.findAllInjectTestsByExerciseId(EXERCISE.getId(),
        searchPaginationInput);
    tests.stream().forEach(test -> this.injectTestStatusService.deleteInjectTest(test.getId()));
  }

  @DisplayName("Check the number of tests of an exercise")
  @Test
  void findAllInjectTestsByExerciseId() {
    // Mock the UserDetails with a custom ID
    User user = this.userRepository.findByEmailIgnoreCase("admin@openbas.io").orElseThrow();
    OpenBASOidcUser oidcUser = new OpenBASOidcUser(user);
    Authentication auth = new UsernamePasswordAuthenticationToken(oidcUser, "password", Collections.EMPTY_LIST);
    SecurityContextHolder.getContext().setAuthentication(auth);

    // -- PREPARE --
    injectTestStatusService.bulkTestInjects(List.of(INJECT1.getId(), INJECT2.getId()));

    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault()
        .size(1110)
        .build();

    // -- EXECUTE --
    Page<InjectTestStatus> tests = injectTestStatusService.findAllInjectTestsByExerciseId(EXERCISE.getId(),
        searchPaginationInput);
    assertEquals(2, tests.stream().toList().size());

    // -- CLEAN --
    tests.stream().forEach(test -> this.injectTestStatusService.deleteInjectTest(test.getId()));
  }

  @DisplayName("Find an inject with ID")
  @Test
  void findTestById() {
    // Mock the UserDetails with a custom ID
    User user = this.userRepository.findByEmailIgnoreCase("admin@openbas.io").orElseThrow();
    OpenBASOidcUser oidcUser = new OpenBASOidcUser(user);
    Authentication auth = new UsernamePasswordAuthenticationToken(oidcUser, "password", Collections.EMPTY_LIST);
    SecurityContextHolder.getContext().setAuthentication(auth);

    // -- PREPARE --
    InjectTestStatus test = injectTestStatusService.testInject(INJECT1.getId());

    // -- EXECUTE --
    InjectTestStatus foundTest = injectTestStatusService.findInjectTestStatusById(test.getId());
    assertNotNull(foundTest);

    // -- CLEAN --
    this.injectTestStatusService.deleteInjectTest(test.getId());
  }

  @DisplayName("Delete an inject with ID")
  @Test
  void deleteInjectTest() {
    // Mock the UserDetails with a custom ID
    User user = this.userRepository.findByEmailIgnoreCase("admin@openbas.io").orElseThrow();
    OpenBASOidcUser oidcUser = new OpenBASOidcUser(user);
    Authentication auth = new UsernamePasswordAuthenticationToken(oidcUser, "password", Collections.EMPTY_LIST);
    SecurityContextHolder.getContext().setAuthentication(auth);

    // -- PREPARE --
    InjectTestStatus test = injectTestStatusService.testInject(INJECT1.getId());

    // --EXECUTE --
    injectTestStatusService.deleteInjectTest(test.getId());

    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault()
        .size(1110)
        .build();
    Page<InjectTestStatus> tests = injectTestStatusService.findAllInjectTestsByExerciseId(EXERCISE.getId(),
        searchPaginationInput);
    assertEquals(0, tests.stream().toList().size());
  }

}
