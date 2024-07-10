package io.openbas.rest.channel;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.injectors.channel.model.ChannelContent;
import io.openbas.rest.channel.form.*;
import io.openbas.rest.channel.model.VirtualArticle;
import io.openbas.rest.channel.response.ChannelReader;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ScenarioService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;
import static io.openbas.rest.channel.ChannelHelper.enrichArticleWithVirtualPublication;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

@RestController
public class ChannelApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ScenarioService scenarioService;
    private ArticleRepository articleRepository;
    private ChannelRepository channelRepository;
    private DocumentRepository documentRepository;
    private InjectExpectationRepository injectExpectationExecutionRepository;
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setArticleRepository(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Autowired
    public void setInjectExpectationExecutionRepository(
            InjectExpectationRepository injectExpectationExecutionRepository) {
        this.injectExpectationExecutionRepository = injectExpectationExecutionRepository;
    }

    @Autowired
    public void setChannelRepository(ChannelRepository channelRepository) {
        this.channelRepository = channelRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setScenarioService(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    // -- CHANNELS --

    @GetMapping("/api/channels")
    public Iterable<Channel> channels() {
        return channelRepository.findAll();
    }

    @GetMapping("/api/channels/{channelId}")
    public Channel channel(@PathVariable String channelId) {
        return channelRepository.findById(channelId).orElseThrow(ElementNotFoundException::new);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/channels/{channelId}")
    public Channel updateChannel(@PathVariable String channelId, @Valid @RequestBody ChannelUpdateInput input) {
        Channel channel = channelRepository.findById(channelId).orElseThrow(ElementNotFoundException::new);
        channel.setUpdateAttributes(input);
        channel.setUpdatedAt(Instant.now());
        return channelRepository.save(channel);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/channels/{channelId}/logos")
    public Channel updateChannelLogos(@PathVariable String channelId, @Valid @RequestBody ChannelUpdateLogoInput input) {
        Channel channel = channelRepository.findById(channelId).orElseThrow(ElementNotFoundException::new);
        if (input.getLogoDark() != null) {
            channel.setLogoDark(documentRepository.findById(input.getLogoDark()).orElse(null));
        } else {
            channel.setLogoDark(null);
        }
        if (input.getLogoLight() != null) {
            channel.setLogoLight(documentRepository.findById(input.getLogoLight()).orElse(null));
        } else {
            channel.setLogoLight(null);
        }
        return channelRepository.save(channel);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/channels")
    @Transactional(rollbackOn = Exception.class)
    public Channel createChannel(@Valid @RequestBody ChannelCreateInput input) {
        Channel channel = new Channel();
        channel.setUpdateAttributes(input);
        return channelRepository.save(channel);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/channels/{channelId}")
    public void deleteChannel(@PathVariable String channelId) {
        channelRepository.deleteById(channelId);
    }

    @GetMapping("/api/observer/channels/{exerciseId}/{channelId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public ChannelReader observerArticles(@PathVariable String exerciseId, @PathVariable String channelId) {
        ChannelReader channelReader;
        Channel channel = channelRepository.findById(channelId).orElseThrow(ElementNotFoundException::new);

        Optional<Exercise> exerciseOpt = this.exerciseRepository.findById(exerciseId);
        if (exerciseOpt.isPresent()) {
            Exercise exercise = exerciseOpt.get();
            channelReader = new ChannelReader(channel, exercise);
            List<Article> publishedArticles = exercise.getArticlesForChannel(channel);
            List<Article> articles = enrichArticleWithVirtualPublication(exercise.getInjects(), publishedArticles, this.mapper);
            channelReader.setChannelArticles(articles);
        } else {
            Scenario scenario = this.scenarioService.scenario(exerciseId);
            channelReader = new ChannelReader(channel, scenario);
            List<Article> publishedArticles = scenario.getArticlesForChannel(channel);
            List<Article> articles = enrichArticleWithVirtualPublication(scenario.getInjects(), publishedArticles, this.mapper);
            channelReader.setChannelArticles(articles);
        }
        return channelReader;
    }

    @GetMapping("/api/player/channels/{exerciseId}/{channelId}")
    public ChannelReader playerArticles(
            @PathVariable String exerciseId,
            @PathVariable String channelId,
            @RequestParam Optional<String> userId) {
        ChannelReader channelReader;
        Channel channel = channelRepository.findById(channelId).orElseThrow(ElementNotFoundException::new);
        List<Inject> injects;

        Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);
        if (exerciseOpt.isPresent()) {
            Exercise exercise = exerciseOpt.get();
            channelReader = new ChannelReader(channel, exercise);
            injects = exercise.getInjects();
        } else {
            Scenario scenario = this.scenarioService.scenario(exerciseId);
            channelReader = new ChannelReader(channel, scenario);
            injects = scenario.getInjects();
        }

        final User user = impersonateUser(userRepository, userId);
        if (user.getId().equals(ANONYMOUS)) {
            throw new UnsupportedOperationException("User must be logged or dynamic player is required");
        }
        Map<String, Instant> toPublishArticleIdsMap = injects.stream()
                .filter(inject -> inject.getInjectorContract()
                        .map(contract -> contract.getId().equals(CHANNEL_PUBLISH))
                        .orElse(false))
                .filter(inject -> inject.getStatus().isPresent())
                .sorted(Comparator.comparing(inject -> inject.getStatus().get().getTrackingSentDate()))
                .flatMap(inject -> {
                    Instant virtualInjectDate = inject.getStatus().get().getTrackingSentDate();
                    try {
                        ChannelContent content = mapper.treeToValue(inject.getContent(), ChannelContent.class);
                        if (content.getArticles() != null) {
                            return content.getArticles().stream().map(article -> new VirtualArticle(virtualInjectDate, article));
                        }
                        return null;
                    } catch (JsonProcessingException e) {
                        // Invalid channel content.
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toMap(VirtualArticle::id, VirtualArticle::date));
        if (!toPublishArticleIdsMap.isEmpty()) {
            List<Article> publishedArticles = fromIterable(articleRepository.findAllById(toPublishArticleIdsMap.keySet()))
                    .stream().filter(article -> article.getChannel().equals(channel))
                    .peek(article -> article.setVirtualPublication(toPublishArticleIdsMap.get(article.getId())))
                    .sorted(Comparator.comparing(Article::getVirtualPublication).reversed())
                    .toList();
            channelReader.setChannelArticles(publishedArticles);
            // Fulfill article expectations
            List<Inject> finalInjects = injects;
            List<InjectExpectation> expectationExecutions = publishedArticles.stream()
                    .flatMap(article -> finalInjects.stream()
                            .flatMap(inject -> inject.getUserExpectationsForArticle(user, article).stream()))
                    .filter(exec -> exec.getResults().isEmpty()).toList();
            expectationExecutions.forEach(injectExpectationExecution -> {
                injectExpectationExecution.setUser(user);
                injectExpectationExecution.setResults(List.of(
                        InjectExpectationResult.builder()
                                .sourceId("media-pressure")
                                .sourceType("media-pressure")
                                .sourceName("Media pressure read")
                                .result(Instant.now().toString())
                                .date(Instant.now().toString())
                                .score(injectExpectationExecution.getExpectedScore())
                                .build()
                ));
                injectExpectationExecution.setScore(injectExpectationExecution.getExpectedScore());
                injectExpectationExecution.setUpdatedAt(Instant.now());
                injectExpectationExecutionRepository.save(injectExpectationExecution);
            });
        }
        return channelReader;
    }

    // -- EXERCISES --

    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @PostMapping("/api/exercises/{exerciseId}/articles")
    @Transactional(rollbackOn = Exception.class)
    public Article createArticleForExercise(
            @PathVariable String exerciseId,
            @Valid @RequestBody ArticleCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Article article = new Article();
        article.setUpdateAttributes(input);
        article.setChannel(channelRepository.findById(input.getChannelId()).orElseThrow(ElementNotFoundException::new));
        article.setExercise(exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new));
        Article savedArticle = articleRepository.save(article);
        List<String> articleDocuments = input.getDocuments();
        List<Document> finalArticleDocuments = new ArrayList<>();
        articleDocuments.forEach(articleDocument -> {
            Optional<Document> doc = documentRepository.findById(articleDocument);
            if (doc.isPresent()) {
                Document document = doc.get();
                finalArticleDocuments.add(document);
                // If Document not yet linked directly to the exercise, attached it
                if (!document.getExercises().contains(exercise)) {
                    exercise.getDocuments().add(document);
                    exerciseRepository.save(exercise);
                }
            }
        });
        savedArticle.setDocuments(finalArticleDocuments);
        return enrichArticleWithVirtualPublication(exercise.getInjects(), savedArticle, this.mapper);
    }

    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @PutMapping("/api/exercises/{exerciseId}/articles/{articleId}")
    public Article updateArticleForExercise(
            @PathVariable String exerciseId,
            @PathVariable String articleId,
            @Valid @RequestBody ArticleUpdateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Article article = articleRepository.findById(articleId).orElseThrow(ElementNotFoundException::new);
        List<String> newDocumentsIds = input.getDocuments();
        List<String> currentDocumentIds = article.getDocuments().stream().map(Document::getId).toList();
        article.setChannel(channelRepository.findById(input.getChannelId()).orElseThrow(ElementNotFoundException::new));
        article.setUpdateAttributes(input);
        // Original List
        List<Document> articleDocuments = new ArrayList<>(article.getDocuments());
        // region Set documents
        // To delete
        article.getDocuments().stream()
                .filter(articleDoc -> !newDocumentsIds.contains(articleDoc.getId()))
                .forEach(articleDocuments::remove);
        // To add
        newDocumentsIds.stream().filter(doc -> !currentDocumentIds.contains(doc)).forEach(in -> {
            Optional<Document> doc = documentRepository.findById(in);
            if (doc.isPresent()) {
                Document document = doc.get();
                articleDocuments.add(document);
                // If Document not yet linked directly to the exercise, attached it
                if (!document.getExercises().contains(exercise)) {
                    exercise.getDocuments().add(document);
                    exerciseRepository.save(exercise);
                }
            }
        });
        article.setDocuments(articleDocuments);
        Article savedArticle = articleRepository.save(article);
        return enrichArticleWithVirtualPublication(exercise.getInjects(), savedArticle, this.mapper);
    }

    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @DeleteMapping("/api/exercises/{exerciseId}/articles/{articleId}")
    @Transactional(rollbackOn = Exception.class)
    public void deleteArticleForExercise(@PathVariable String exerciseId, @PathVariable String articleId) {
        articleRepository.deleteById(articleId);
    }

    // -- SCENARIOS --

    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @PostMapping(SCENARIO_URI + "/{scenarioId}/articles")
    @Transactional(rollbackOn = Exception.class)
    public Article createArticleForScenario(
            @PathVariable @NotBlank final String scenarioId,
            @Valid @RequestBody ArticleCreateInput input) {
        Scenario scenario = this.scenarioService.scenario(scenarioId);
        Article article = new Article();
        article.setUpdateAttributes(input);
        article.setChannel(this.channelRepository.findById(input.getChannelId()).orElseThrow(ElementNotFoundException::new));
        article.setScenario(scenario);
        Article savedArticle = this.articleRepository.save(article);
        List<String> articleDocuments = input.getDocuments();
        List<Document> finalArticleDocuments = new ArrayList<>();
        articleDocuments.forEach(articleDocument -> {
            Optional<Document> doc = this.documentRepository.findById(articleDocument);
            if (doc.isPresent()) {
                Document document = doc.get();
                finalArticleDocuments.add(document);
                // If Document not yet linked directly to the exercise, attached it
                if (!document.getScenarios().contains(scenario)) {
                    scenario.getDocuments().add(document);
                    this.scenarioService.updateScenario(scenario);
                }
            }
        });
        savedArticle.setDocuments(finalArticleDocuments);
        return enrichArticleWithVirtualPublication(scenario.getInjects(), savedArticle, this.mapper);
    }

    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @PutMapping(SCENARIO_URI + "/{scenarioId}/articles/{articleId}")
    @Transactional(rollbackOn = Exception.class)
    public Article updateArticleForScenario(
            @PathVariable @NotBlank final String scenarioId,
            @PathVariable @NotBlank final String articleId,
            @Valid @RequestBody ArticleUpdateInput input) {
        Scenario scenario = this.scenarioService.scenario(scenarioId);
        Article article = articleRepository.findById(articleId).orElseThrow(ElementNotFoundException::new);
        List<String> newDocumentsIds = input.getDocuments();
        List<String> currentDocumentIds = article.getDocuments().stream().map(Document::getId).toList();
        article.setChannel(channelRepository.findById(input.getChannelId()).orElseThrow(ElementNotFoundException::new));
        article.setUpdateAttributes(input);
        // Original List
        List<Document> articleDocuments = new ArrayList<>(article.getDocuments());
        // region Set documents
        // To delete
        article.getDocuments().stream()
                .filter(articleDoc -> !newDocumentsIds.contains(articleDoc.getId()))
                .forEach(articleDocuments::remove);
        // To add
        newDocumentsIds.stream().filter(doc -> !currentDocumentIds.contains(doc)).forEach(in -> {
            Optional<Document> doc = documentRepository.findById(in);
            if (doc.isPresent()) {
                Document document = doc.get();
                articleDocuments.add(document);
                // If Document not yet linked directly to the exercise, attached it
                if (!document.getScenarios().contains(scenario)) {
                    scenario.getDocuments().add(document);
                    this.scenarioService.updateScenario(scenario);
                }
            }
        });
        article.setDocuments(articleDocuments);
        Article savedArticle = articleRepository.save(article);
        return enrichArticleWithVirtualPublication(scenario.getInjects(), savedArticle, this.mapper);
    }

    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @DeleteMapping(SCENARIO_URI + "/{scenarioId}/articles/{articleId}")
    @Transactional(rollbackOn = Exception.class)
    public void deleteArticleForScenario(
            @PathVariable @NotBlank final String scenarioId,
            @PathVariable @NotBlank final String articleId) {
        articleRepository.deleteById(articleId);
    }
}
