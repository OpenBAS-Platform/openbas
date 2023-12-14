package io.openex.rest.channel;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.injects.channel.model.ChannelContent;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.channel.form.*;
import io.openex.rest.channel.model.VirtualArticle;
import io.openex.rest.channel.response.ChannelReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static io.openex.config.OpenExAnonymous.ANONYMOUS;
import static io.openex.database.model.Inject.SPEED_STANDARD;
import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.injects.channel.ChannelContract.CHANNEL_PUBLISH;
import static java.util.Comparator.naturalOrder;
import static java.util.Comparator.nullsFirst;

@RestController
public class ChannelApi extends RestBehavior {

  private ExerciseRepository exerciseRepository;
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
  public void setDocumentRepository(DocumentRepository documentRepository) {
    this.documentRepository = documentRepository;
  }

  @GetMapping("/api/channels")
  public Iterable<Channel> channels() {
    return channelRepository.findAll();
  }

  @GetMapping("/api/channels/{channelId}")
  public Channel channel(@PathVariable String channelId) {
    return channelRepository.findById(channelId).orElseThrow();
  }

  @RolesAllowed(ROLE_ADMIN)
  @PutMapping("/api/channels/{channelId}")
  public Channel updateChannel(@PathVariable String channelId, @Valid @RequestBody ChannelUpdateInput input) {
    Channel channel = channelRepository.findById(channelId).orElseThrow();
    channel.setUpdateAttributes(input);
    return channelRepository.save(channel);
  }

  @RolesAllowed(ROLE_ADMIN)
  @PutMapping("/api/channels/{channelId}/logos")
  public Channel updateChannelLogos(@PathVariable String channelId, @Valid @RequestBody ChannelUpdateLogoInput input) {
    Channel channel = channelRepository.findById(channelId).orElseThrow();
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

  @RolesAllowed(ROLE_ADMIN)
  @PostMapping("/api/channels")
  public Channel createChannel(@Valid @RequestBody ChannelCreateInput input) {
    Channel channel = new Channel();
    channel.setUpdateAttributes(input);
    return channelRepository.save(channel);
  }

  @RolesAllowed(ROLE_ADMIN)
  @DeleteMapping("/api/channels/{channelId}")
  public void deleteChannel(@PathVariable String channelId) {
    channelRepository.deleteById(channelId);
  }

  private List<Article> enrichArticleWithVirtualPublication(Exercise exercise, List<Article> articles) {
    Instant now = Instant.now();
    Map<String, Instant> toPublishArticleIdsMap = exercise.getInjects().stream()
        .filter(inject -> inject.getContract().equals(CHANNEL_PUBLISH))
        .filter(inject -> inject.getContent() != null)
        // TODO take into account depends_another here, depends_duration is not enough to order articles
        .sorted(Comparator.comparing(Inject::getDependsDuration))
        .flatMap(inject -> {
          Instant virtualInjectDate = inject.computeInjectDate(now, SPEED_STANDARD);
          try {
            ChannelContent content = mapper.treeToValue(inject.getContent(), ChannelContent.class);
            return content.getArticles().stream().map(article -> new VirtualArticle(virtualInjectDate, article));
          } catch (JsonProcessingException e) {
            // Invalid channel content.
            return null;
          }
        })
        .filter(Objects::nonNull)
        .distinct()
        .collect(Collectors.toMap(VirtualArticle::id, VirtualArticle::date));
    return articles.stream()
        .peek(article -> article.setVirtualPublication(toPublishArticleIdsMap.get(article.getId())))
        .sorted(Comparator.comparing(Article::getVirtualPublication, nullsFirst(naturalOrder()))
            .thenComparing(Article::getCreatedAt).reversed()).toList();
  }

  private Article enrichArticleWithVirtualPublication(Exercise exercise, Article article) {
    return enrichArticleWithVirtualPublication(exercise, List.of(article)).stream().findFirst().orElseThrow();
  }

  // region articles
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  @PostMapping("/api/exercises/{exerciseId}/articles")
  public Article createArticle(@PathVariable String exerciseId, @Valid @RequestBody ArticleCreateInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    Article article = new Article();
    article.setUpdateAttributes(input);
    article.setChannel(channelRepository.findById(input.getChannelId()).orElseThrow());
    article.setExercise(exerciseRepository.findById(exerciseId).orElseThrow());
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
    return enrichArticleWithVirtualPublication(exercise, savedArticle);
  }

  @PreAuthorize("isExercisePlanner(#exerciseId)")
  @PutMapping("/api/exercises/{exerciseId}/articles/{articleId}")
  public Article updateArticle(@PathVariable String exerciseId, @PathVariable String articleId,
      @Valid @RequestBody ArticleUpdateInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    Article article = articleRepository.findById(articleId).orElseThrow();
    List<String> newDocumentsIds = input.getDocuments();
    List<String> currentDocumentIds = article.getDocuments().stream().map(Document::getId).toList();
    article.setChannel(channelRepository.findById(input.getChannelId()).orElseThrow());
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
    return enrichArticleWithVirtualPublication(exercise, savedArticle);
  }

  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @GetMapping("/api/exercises/{exerciseId}/articles")
  public Iterable<Article> exerciseArticles(@PathVariable String exerciseId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    return enrichArticleWithVirtualPublication(exercise, exercise.getArticles());
  }

  @Transactional(rollbackOn = Exception.class)
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  @DeleteMapping("/api/exercises/{exerciseId}/articles/{articleId}")
  public void deleteArticle(@PathVariable String exerciseId, @PathVariable String articleId) {
    articleRepository.deleteById(articleId);
  }
  // endregion

  @GetMapping("/api/observer/channels/{exerciseId}/{channelId}")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public ChannelReader observerArticles(@PathVariable String exerciseId, @PathVariable String channelId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    Channel channel = channelRepository.findById(channelId).orElseThrow();
    ChannelReader channelReader = new ChannelReader(channel, exercise);
    List<Article> publishedArticles = exercise.getArticlesForChannel(channel);
    List<Article> articles = enrichArticleWithVirtualPublication(exercise, publishedArticles);
    channelReader.setChannelArticles(articles);
    return channelReader;
  }

  @GetMapping("/api/player/channels/{exerciseId}/{channelId}")
  public ChannelReader playerArticles(@PathVariable String exerciseId, @PathVariable String channelId,
      @RequestParam Optional<String> userId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    Channel channel = channelRepository.findById(channelId).orElseThrow();
    ChannelReader channelReader = new ChannelReader(channel, exercise);
    Map<String, Instant> toPublishArticleIdsMap = exercise.getInjects().stream()
        .filter(inject -> inject.getContract().equals(CHANNEL_PUBLISH))
        .filter(inject -> inject.getStatus().isPresent())
        .sorted(Comparator.comparing(inject -> inject.getStatus().get().getDate()))
        .flatMap(inject -> {
          Instant virtualInjectDate = inject.getStatus().get().getDate();
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
      List<InjectExpectation> expectationExecutions = publishedArticles.stream()
          .flatMap(article -> exercise.getInjects().stream()
              .flatMap(inject -> inject.getUserExpectationsForArticle(user, article).stream()))
          .filter(exec -> exec.getResult() == null).toList();
      expectationExecutions.forEach(injectExpectationExecution -> {
        injectExpectationExecution.setUser(user);
        injectExpectationExecution.setResult(Instant.now().toString());
        injectExpectationExecution.setScore(injectExpectationExecution.getExpectedScore());
        injectExpectationExecution.setUpdatedAt(Instant.now());
        injectExpectationExecutionRepository.save(injectExpectationExecution);
      });
    }
    return channelReader;
  }
}
