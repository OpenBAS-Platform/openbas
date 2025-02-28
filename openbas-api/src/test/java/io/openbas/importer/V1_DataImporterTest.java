package io.openbas.importer;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.utils.Constants;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(PER_CLASS)
class V1_DataImporterTest extends IntegrationTest {

  @Autowired private V1_DataImporter importer;

  @Autowired private ExerciseRepository exerciseRepository;

  @Autowired private TeamRepository teamRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private OrganizationRepository organizationRepository;

  @Autowired private TagRepository tagRepository;

  private JsonNode importNode;

  public static final String EXERCISE_NAME =
      "Test Exercise %s".formatted(Constants.IMPORTED_OBJECT_NAME_SUFFIX);
  public static final String TEAM_NAME = "Animation team";
  public static final String USER_EMAIL = "Romuald.Lemesle@openbas.io";
  public static final String ORGANIZATION_NAME = "Filigran";
  public static final String TAG_NAME = "crisis exercise";

  @BeforeAll
  public void setUp() throws Exception {
    MockitoAnnotations.openMocks(this);
    ObjectMapper mapper = new ObjectMapper();
    String jsonContent =
        new String(
            Files.readAllBytes(Paths.get("src/test/resources/importer-v1/import-data.json")));
    this.importNode = mapper.readTree(jsonContent);
  }

  @Test
  @Transactional
  void testImportData() {
    // -- EXECUTE --
    this.importer.importData(this.importNode, Map.of(), null, null);

    // -- ASSERT --
    Optional<Exercise> exercise = this.exerciseRepository.findOne(exerciseByName(EXERCISE_NAME));
    assertTrue(exercise.isPresent());

    Optional<Team> team = this.teamRepository.findByName(TEAM_NAME);
    assertTrue(team.isPresent());
    assertEquals(1, team.get().getUsersNumber());
    assertEquals(ORGANIZATION_NAME, team.get().getOrganization().getName());
    assertEquals(1, team.get().getTags().size());

    Optional<User> user = this.userRepository.findByEmailIgnoreCase(USER_EMAIL);
    assertTrue(user.isPresent());
    assertEquals(ORGANIZATION_NAME, user.get().getOrganization().getName());
    assertEquals(1, user.get().getTags().size());

    List<Organization> organization =
        this.organizationRepository.findByNameIgnoreCase(ORGANIZATION_NAME);
    assertFalse(organization.isEmpty());
    assertEquals(ORGANIZATION_NAME, organization.getFirst().getName());

    List<Tag> tag = this.tagRepository.findByNameIgnoreCase(TAG_NAME);
    assertFalse(tag.isEmpty());
    assertEquals(TAG_NAME, tag.getFirst().getName());

    // -- CLEAN --
    this.tagRepository.delete(tag.getFirst());
    this.organizationRepository.delete(organization.getFirst());
    this.userRepository.delete(user.get());
    this.teamRepository.delete(team.get());
    this.exerciseRepository.delete(exercise.get());
  }

  // -- UTILS --

  private static Specification<Exercise> exerciseByName(@NotNull final String name) {
    return (root, query, cb) -> cb.equal(root.get("name"), name);
  }
}
