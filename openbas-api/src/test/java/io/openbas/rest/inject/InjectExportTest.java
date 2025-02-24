package io.openbas.rest.inject;

import static io.openbas.rest.inject.InjectApi.INJECT_URI;
import static io.openbas.utils.fixtures.FileFixture.WELL_KNOWN_FILES;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_ARRAY_ORDER;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.export.Mixins;
import io.openbas.rest.inject.form.ExportOptionsInput;
import io.openbas.rest.inject.form.InjectExportFromSearchRequestInput;
import io.openbas.rest.inject.form.InjectExportRequestInput;
import io.openbas.rest.inject.form.InjectExportTarget;
import io.openbas.service.FileService;
import io.openbas.utils.ZipUtils;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.helpers.GrantHelper;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.mockUser.WithMockUnprivilegedUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityManager;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Inject JSON export tests")
public class InjectExportTest extends IntegrationTest {

  public final String INJECT_EXPORT_URI = INJECT_URI + "/export";
  public final String INJECT_EXPORT_SEARCH_URI = INJECT_URI + "/search/export";

  @Autowired private InjectComposer injectComposer;
  @Autowired private DocumentComposer documentComposer;
  @Autowired private InjectorContractComposer injectorContractComposer;
  @Autowired private ChallengeComposer challengeComposer;
  @Autowired private ArticleComposer articleComposer;
  @Autowired private ChannelComposer channelComposer;
  @Autowired private TagComposer tagComposer;
  @Autowired private UserComposer userComposer;
  @Autowired private TeamComposer teamComposer;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private ScenarioComposer scenarioComposer;
  @Autowired private InjectorFixture injectorFixture;
  @Autowired private PayloadComposer payloadComposer;
  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper mapper;
  @Autowired private FileService fileService;
  @Autowired private GrantHelper grantHelper;
  @Autowired private EntityManager entityManager;
  @Autowired private InjectRepository injectRepository;

  @BeforeEach
  public void setup() throws Exception {
    injectComposer.reset();
    documentComposer.reset();
    injectorContractComposer.reset();
    challengeComposer.reset();
    articleComposer.reset();
    channelComposer.reset();
    teamComposer.reset();
    userComposer.reset();
    tagComposer.reset();
    exerciseComposer.reset();
    scenarioComposer.reset();
    payloadComposer.reset();

    // delete the test files from the minio service
    for (String fileName : WELL_KNOWN_FILES.keySet()) {
      fileService.deleteFile(fileName);
    }

    knownArticlesToExport.clear();
  }

  private final List<Article> knownArticlesToExport = new ArrayList<>();

  private List<InjectComposer.Composer> createDefaultInjectWrappers() {
    ArticleComposer.Composer articleToExportFromExercise =
        articleComposer
            .forArticle(ArticleFixture.getDefaultArticle())
            .withChannel(channelComposer.forChannel(ChannelFixture.getDefaultChannel()));
    knownArticlesToExport.add(articleToExportFromExercise.get());
    ArticleComposer.Composer articleToExportFromScenario =
        articleComposer
            .forArticle(ArticleFixture.getDefaultArticle())
            .withChannel(channelComposer.forChannel(ChannelFixture.getDefaultChannel()));
    knownArticlesToExport.add(articleToExportFromScenario.get());
    InjectComposer.Composer injectWithExerciseComposer =
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withTag(tagComposer.forTag(TagFixture.getTagWithText("Other inject tag")))
            .withInjectorContract(
                injectorContractComposer
                    .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                    .withArticle(articleToExportFromExercise))
            .withDocument(
                documentComposer
                    .forDocument(DocumentFixture.getDocument(FileFixture.getPlainTextFileContent()))
                    .withInMemoryFile(FileFixture.getPlainTextFileContent()));
    InjectComposer.Composer injectOtherForExerciseComposer =
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withTag(tagComposer.forTag(TagFixture.getTagWithText("Other inject again tag")))
            .withInjectorContract(
                injectorContractComposer
                    .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                    .withInjector(InjectorFixture.createDefaultPayloadInjector())
                    .withPayload(
                        payloadComposer.forPayload(PayloadFixture.createDefaultCommand())));
    // wrap it in a persisted exercise
    exerciseComposer
        .forExercise(ExerciseFixture.createDefaultExercise())
        .withArticle(
            articleComposer
                .forArticle(ArticleFixture.getDefaultArticle())
                .withChannel(channelComposer.forChannel(ChannelFixture.getDefaultChannel())))
        .withArticle(articleToExportFromExercise)
        .persist()
        .withInject(injectWithExerciseComposer)
        .withInject(injectOtherForExerciseComposer);

    InjectComposer.Composer injectWithScenarioComposer =
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withInjectorContract(
                injectorContractComposer
                    .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                    .withArticle(articleToExportFromScenario))
            .withTeam(
                teamComposer
                    .forTeam(TeamFixture.getDefaultTeam())
                    .withUser(userComposer.forUser(UserFixture.getUserWithDefaultEmail())));

    // wrap it in a persisted scenario
    scenarioComposer
        .forScenario(ScenarioFixture.getScenario())
        .withArticle(articleToExportFromScenario)
        .withArticle(
            articleComposer
                .forArticle(ArticleFixture.getDefaultArticle())
                .withChannel(channelComposer.forChannel(ChannelFixture.getDefaultChannel())))
        .persist()
        .withInject(injectWithScenarioComposer);

    return List.of(
        // challenge inject
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withInjectorContract(
                injectorContractComposer
                    .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                    .withChallenge(
                        challengeComposer
                            .forChallenge(ChallengeFixture.createDefaultChallenge())
                            .withTag(
                                tagComposer.forTag(
                                    TagFixture.getTagWithText("Challenge inject tag"))))),
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withInjectorContract(
                injectorContractComposer
                    .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                    .withChallenge(
                        challengeComposer
                            .forChallenge(ChallengeFixture.createDefaultChallenge())
                            .withDocument(
                                documentComposer
                                    .forDocument(
                                        DocumentFixture.getDocument(
                                            FileFixture.getPngGridFileContent()))
                                    .withInMemoryFile(FileFixture.getPngGridFileContent())
                                    .withTag(
                                        tagComposer.forTag(
                                            TagFixture.getTagWithText("Document tag")))))),
        // these are set up above
        injectWithExerciseComposer,
        injectOtherForExerciseComposer,
        injectWithScenarioComposer);
  }

  private Set<Exercise> getExercisesFromInjectWrappers(List<InjectComposer.Composer> injects) {
    return injects.stream().map(wrapper -> wrapper.get().getExercise()).collect(Collectors.toSet());
  }

  private List<InjectExportTarget> createDefaultInjectTargets() {
    return createDefaultInjectTargets(createDefaultInjectWrappers());
  }

  private List<InjectExportTarget> createDefaultInjectTargets(
      List<InjectComposer.Composer> injectComposers) {
    injectComposers.forEach(InjectComposer.Composer::persist);
    List<String> persistedInjectIds = injectComposers.stream().map(w -> w.get().getId()).toList();

    return new ArrayList<>(
        persistedInjectIds.stream()
            .map(
                id -> {
                  InjectExportTarget tgt = new InjectExportTarget();
                  tgt.setId(id);
                  return tgt;
                })
            .toList());
  }

  private InjectExportRequestInput createDefaultInjectExportRequestInput() {
    return createDefaultInjectExportRequestInput(false, false, false);
  }

  private InjectExportRequestInput createDefaultInjectExportRequestInput(
      boolean withPlayers, boolean withTeams, boolean withVariableValues) {
    return createDefaultInjectExportRequestInput(
        createDefaultInjectTargets(), withPlayers, withTeams, withVariableValues);
  }

  private InjectExportRequestInput createDefaultInjectExportRequestInput(
      List<InjectExportTarget> targets) {
    return createDefaultInjectExportRequestInput(targets, false, false, false);
  }

  private InjectExportRequestInput createDefaultInjectExportRequestInput(
      List<InjectExportTarget> targets,
      boolean withPlayers,
      boolean withTeams,
      boolean withVariableValues) {
    InjectExportRequestInput input = new InjectExportRequestInput();
    ExportOptionsInput exportOptions = new ExportOptionsInput();
    exportOptions.setWithPlayers(withPlayers);
    exportOptions.setWithTeams(withTeams);
    exportOptions.setWithVariableValues(withVariableValues);
    input.setInjects(targets);
    input.setExportOptions(exportOptions);
    return input;
  }

  private InjectExportFromSearchRequestInput createDefaultInjectExportFromSearchInput(
      List<InjectComposer.Composer> injectWrappers,
      String simulationOrScenarioId,
      boolean withPlayers,
      boolean withTeams,
      boolean withVariableValues) {
    injectWrappers.forEach(InjectComposer.Composer::persist);

    SearchPaginationInput searchInput = new SearchPaginationInput();
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    filterGroup.setMode(Filters.FilterMode.and);
    Filters.Filter filter1 = new Filters.Filter();
    filter1.setKey("inject_platforms");
    filter1.setMode(Filters.FilterMode.and);
    filter1.setValues(new ArrayList<>());
    filter1.setOperator(Filters.FilterOperator.contains);
    filterGroup.setFilters(List.of(filter1));
    searchInput.setFilterGroup(filterGroup);
    searchInput.setTextSearch("");

    InjectExportFromSearchRequestInput exportInput = new InjectExportFromSearchRequestInput();
    exportInput.setSearchPaginationInput(searchInput);
    exportInput.setInjectIDsToIgnore(List.of());
    exportInput.setSimulationOrScenarioId(simulationOrScenarioId);

    ExportOptionsInput options = new ExportOptionsInput();
    options.setWithPlayers(withPlayers);
    options.setWithTeams(withTeams);
    options.setWithVariableValues(withVariableValues);
    exportInput.setExportOptions(options);

    return exportInput;
  }

  @Nested
  @DisplayName("When unauthenticated")
  public class WhenUnauthenticated {
    @Test
    @DisplayName("Return UNAUTHORISED")
    public void whenLackingAuthorisation_returnUnauthorised() throws Exception {
      mvc.perform(post(INJECT_URI + "/export").contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isUnauthorized());
    }
  }

  @Nested
  @WithMockUnprivilegedUser
  @DisplayName("When standard user with staggered privileges")
  public class WhenStandardUserWithStaggeredPrivileges {
    @Test
    @DisplayName("When lacking OBSERVER grant on some scenarios, return NOT FOUND")
    public void whenLackingOBSERVERGrantOnSomeScenariosReturnNOTFOUND() throws Exception {
      List<InjectComposer.Composer> injectWrappers = createDefaultInjectWrappers();

      // grant Observer on exercise but not the scenario
      List<InjectComposer.Composer> injectsFromExercise =
          injectWrappers.stream().filter(wrapper -> wrapper.get().getExercise() != null).toList();

      getExercisesFromInjectWrappers(injectsFromExercise)
          .forEach(exercise -> grantHelper.grantExerciseObserver(exercise));

      entityManager.flush();
      entityManager.clear();

      InjectExportRequestInput input =
          createDefaultInjectExportRequestInput(createDefaultInjectTargets(injectWrappers));

      String not_found_response =
          mvc.perform(
                  post(INJECT_EXPORT_URI)
                      .content(mapper.writeValueAsString(input))
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isNotFound())
              .andReturn()
              .getResponse()
              .getContentAsString();

      List<String> expected_not_found_ids =
          injectWrappers.stream()
              .map(wrapper -> wrapper.get().getId())
              .filter(
                  id ->
                      !injectsFromExercise.stream()
                          .map(wrapper -> wrapper.get().getId())
                          .toList()
                          .contains(id))
              .toList();

      assertThatJson(not_found_response)
          .node("message")
          .isEqualTo("Element not found: %s".formatted(String.join(", ", expected_not_found_ids)));
    }

    @Test
    @DisplayName("When lacking OBSERVER grant on some exercises, return NOT FOUND")
    public void whenLackingOBSERVERGrantOnSomeExercisesReturnNOTFOUND() throws Exception {
      List<InjectComposer.Composer> injectWrappers = createDefaultInjectWrappers();

      // grant Observer on scenario but not the exercise
      InjectComposer.Composer injectWithScenario =
          injectWrappers.stream()
              .filter(wrapper -> wrapper.get().getScenario() != null)
              .findAny()
              .get();
      grantHelper.grantScenarioObserver(injectWithScenario.get().getScenario());

      entityManager.flush();
      entityManager.clear();

      InjectExportRequestInput input =
          createDefaultInjectExportRequestInput(createDefaultInjectTargets(injectWrappers));

      String not_found_response =
          mvc.perform(
                  post(INJECT_EXPORT_URI)
                      .content(mapper.writeValueAsString(input))
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isNotFound())
              .andReturn()
              .getResponse()
              .getContentAsString();

      List<String> expected_not_found_ids =
          injectWrappers.stream()
              .map(wrapper -> wrapper.get().getId())
              .filter(id -> !id.equals(injectWithScenario.get().getId()))
              .toList();

      assertThatJson(not_found_response)
          .node("message")
          .isEqualTo("Element not found: %s".formatted(String.join(", ", expected_not_found_ids)));
    }

    @Nested
    @DisplayName("With search specification input")
    public class withSearchSpecificationInput {

      @Test
      @DisplayName("When lacking OBSERVER grant on exercise, return NOT FOUND")
      public void whenLackingOBSERVERGrantOnExerciseReturnNotFound() throws Exception {
        List<InjectComposer.Composer> injectWrappers = createDefaultInjectWrappers();

        // omit granting Observer on exercise
        List<InjectComposer.Composer> injectsFromExercise =
            injectWrappers.stream().filter(wrapper -> wrapper.get().getExercise() != null).toList();

        InjectExportFromSearchRequestInput exportInput =
            createDefaultInjectExportFromSearchInput(
                injectWrappers,
                injectsFromExercise.stream()
                    .map(wrapper -> wrapper.get().getExercise())
                    .collect(Collectors.toSet())
                    .stream()
                    .findAny()
                    .get()
                    .getId(),
                false,
                false,
                false);

        entityManager.flush();
        entityManager.clear();

        String not_found_response =
            mvc.perform(
                    post(INJECT_EXPORT_SEARCH_URI)
                        .content(mapper.writeValueAsString(exportInput))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThatJson(not_found_response).node("message").isEqualTo("Not Found");
      }

      @Test
      @DisplayName("With OBSERVER grant on exercise, return injects")
      public void withOBSERVERGrantOnExerciseReturnInjects() throws Exception {
        List<InjectComposer.Composer> injectWrappers = createDefaultInjectWrappers();

        // omit granting Observer on exercise
        List<InjectComposer.Composer> injectsFromExercise =
            injectWrappers.stream().filter(wrapper -> wrapper.get().getExercise() != null).toList();
        Set<Exercise> exercises = getExercisesFromInjectWrappers(injectsFromExercise);
        exercises.forEach(exercise -> grantHelper.grantExerciseObserver(exercise));

        InjectExportFromSearchRequestInput exportInput =
            createDefaultInjectExportFromSearchInput(
                injectWrappers, exercises.stream().findFirst().get().getId(), false, false, false);

        entityManager.flush();
        entityManager.clear();
        byte[] response =
            mvc.perform(
                    post(INJECT_EXPORT_SEARCH_URI)
                        .content(mapper.writeValueAsString(exportInput))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Inject.class, Mixins.Inject.class);
        List<Inject> injectsFromDb =
            injectRepository.findAllById(
                injectsFromExercise.stream().map(wrapper -> wrapper.get().getId()).toList());
        String injectJson = objectMapper.writeValueAsString(injectsFromDb);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_information")
            .isEqualTo(injectJson);
      }

      @Test
      @DisplayName("With OBSERVER grant on exercise with exclusion, return correct injects")
      public void withOBSERVERGrantOnExerciseWithExclusionReturnCorrectInjects() throws Exception {
        List<InjectComposer.Composer> injectWrappers = createDefaultInjectWrappers();

        // omit granting Observer on exercise
        List<InjectComposer.Composer> injectsFromExercise =
            injectWrappers.stream().filter(wrapper -> wrapper.get().getExercise() != null).toList();
        Set<Exercise> exercises = getExercisesFromInjectWrappers(injectsFromExercise);
        exercises.forEach(exercise -> grantHelper.grantExerciseObserver(exercise));

        InjectExportFromSearchRequestInput exportInput =
            createDefaultInjectExportFromSearchInput(
                injectWrappers, exercises.stream().findFirst().get().getId(), false, false, false);

        List<String> excludedIds = List.of(injectsFromExercise.getFirst().get().getId());
        exportInput.setInjectIDsToIgnore(excludedIds);

        entityManager.flush();
        entityManager.clear();
        byte[] response =
            mvc.perform(
                    post(INJECT_EXPORT_SEARCH_URI)
                        .content(mapper.writeValueAsString(exportInput))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Inject.class, Mixins.Inject.class);
        List<Inject> injectsFromDb =
            injectRepository.findAllById(
                injectsFromExercise.stream()
                    .map(wrapper -> wrapper.get().getId())
                    .filter(id -> !excludedIds.contains(id))
                    .toList());
        String injectJson = objectMapper.writeValueAsString(injectsFromDb);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_information")
            .isEqualTo(injectJson);
      }
    }
  }

  @Nested
  @WithMockAdminUser
  @DisplayName("With admin authorisation")
  public class WithAdminAuthorisation {
    @Test
    @DisplayName("When a single target inject is not found in the database, return NOT FOUND")
    public void whenSingleTargetInjectIsNotFound_returnNotFound() throws Exception {
      List<InjectExportTarget> targets = createDefaultInjectTargets();

      InjectExportTarget extra_target = new InjectExportTarget();
      extra_target.setId(UUID.randomUUID().toString());

      targets.add(extra_target);

      InjectExportRequestInput input = new InjectExportRequestInput();
      input.setInjects(targets);

      String responseBody =
          mvc.perform(
                  post(INJECT_EXPORT_URI)
                      .content(mapper.writeValueAsString(input))
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isNotFound())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertThatJson(responseBody)
          .node("message")
          .isEqualTo("Element not found: %s".formatted(extra_target.getId()));
    }

    @Nested
    @DisplayName("With default export options")
    public class WithDefaultExportOptions {
      private byte[] doExport() throws Exception {
        return mvc.perform(
                post(INJECT_EXPORT_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(createDefaultInjectExportRequestInput())))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
      }

      @Test
      @DisplayName("Returned zip file contains json with correct injects")
      public void returnedZipFileContainsJsonWithCorrectInjects() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Inject.class, Mixins.Inject.class);
        String injectJson = objectMapper.writeValueAsString(injectComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_information")
            .isEqualTo(injectJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct challenges")
      public void returnedZipFileContainsJsonWithCorrectChallenges() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Challenge.class, Mixins.Challenge.class);
        String challengeJson = objectMapper.writeValueAsString(challengeComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_challenges")
            .isEqualTo(challengeJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct articles")
      public void returnedZipFileContainsJsonWithCorrectArticles() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Article.class, Mixins.Article.class);
        String articleJson = objectMapper.writeValueAsString(knownArticlesToExport);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_articles")
            .isEqualTo(articleJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct channels")
      public void returnedZipFileContainsJsonWithCorrectChannels() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Channel.class, Mixins.Channel.class);
        String channelJson =
            objectMapper.writeValueAsString(
                knownArticlesToExport.stream().map(Article::getChannel));

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_channels")
            .isEqualTo(channelJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct documents")
      public void returnedZipFileContainsJsonWithCorrectDocuments() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Document.class, Mixins.Document.class);
        String documentJson = objectMapper.writeValueAsString(documentComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_documents")
            .isEqualTo(documentJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with empty teams key")
      public void returnedZipFileContainsJsonWithEmptyTeamsKey() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_teams").isEqualTo("[]");
      }

      @Test
      @DisplayName("Returned zip file contains json with absent users key")
      public void returnedZipFileContainsJsonWithAbsentUsersKey() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_users").isAbsent();
      }

      @Test
      @DisplayName("Returned zip file contains document files")
      public void returnedZipFileContainsDocumentFiles() throws Exception {
        byte[] response = doExport();

        for (Document document : documentComposer.generatedItems) {
          try (ByteArrayInputStream fis =
              new ByteArrayInputStream(
                  WELL_KNOWN_FILES.get(document.getTarget()).getContentBytes())) {
            byte[] docFromZip =
                ZipUtils.getZipEntry(response, document.getTarget(), ZipUtils::streamToBytes);
            byte[] docFromDisk = fis.readAllBytes();

            Assertions.assertArrayEquals(docFromZip, docFromDisk);
          }
        }
      }
    }

    @Nested
    @DisplayName("With embedded teams and not users options")
    public class WithEmbeddedTeamsExportOption {
      private byte[] doExport() throws Exception {
        return mvc.perform(
                post(INJECT_EXPORT_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            createDefaultInjectExportRequestInput(false, true, false))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
      }

      @Test
      @DisplayName("Returned teams are correct")
      public void returnedTeamsAreCorrect() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Team.class, Mixins.EmptyTeam.class);
        String teamJson = objectMapper.writeValueAsString(teamComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_teams")
            .isEqualTo(teamJson);
      }

      @Test
      @DisplayName("Users are absent")
      public void usersAreAbsent() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_users").isAbsent();
      }
    }

    @Nested
    @DisplayName("With embedded users and not teams options")
    public class WithEmbeddedUsersAndNotTeamsExportOption {
      private byte[] doExport() throws Exception {
        return mvc.perform(
                post(INJECT_EXPORT_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            createDefaultInjectExportRequestInput(true, false, false))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
      }

      @Test
      @DisplayName("Returned teams are empty")
      public void returnedTeamsAreCorrect() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_teams").isEqualTo("[]");
      }

      @Test
      @DisplayName("Returned users are empty")
      public void returnedUsersAreEmpty() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_users").isEqualTo("[]");
      }
    }
  }
}
