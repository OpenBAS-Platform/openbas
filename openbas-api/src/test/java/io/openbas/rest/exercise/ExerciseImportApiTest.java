package io.openbas.rest.exercise;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Executor;
import io.openbas.database.repository.ExecutorRepository;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.UUID;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestInstance(PER_CLASS)
public class ExerciseImportApiTest extends IntegrationTest {
  @Autowired private ExecutorRepository executorRepository;
  @Autowired private EntityManager entityManager;

  @Test
  public void testImportExercise() {

    String common_id = UUID.randomUUID().toString();

    Executor ex1 = new Executor();
    ex1.setId(common_id);
    ex1.setType("toto");
    ex1.setName("toto");

    executorRepository.save(ex1);
    entityManager.flush();
    entityManager.clear();

    Executor ex2 = new Executor();
    ex2.setId(common_id);
    ex2.setType("titi");
    ex2.setName("titi");

    executorRepository.save(ex2);
    entityManager.flush();
    entityManager.clear();

    List<Executor> executors =
        StreamSupport.stream(executorRepository.findAll().spliterator(), false).toList();
    return;
  }
}
