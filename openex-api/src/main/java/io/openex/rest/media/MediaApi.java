package io.openex.rest.media;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.injects.media.model.MediaContent;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.media.form.*;
import io.openex.rest.media.model.VirtualArticle;
import io.openex.rest.media.response.MediaReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static io.openex.database.model.Inject.SPEED_STANDARD;
import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.helper.UserHelper.ANONYMOUS;
import static io.openex.helper.UserHelper.currentUser;
import static io.openex.injects.media.MediaContract.MEDIA_PUBLISH;
import static java.util.Comparator.naturalOrder;
import static java.util.Comparator.nullsFirst;

@RestController
public class MediaApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ArticleRepository articleRepository;
    private MediaRepository mediaRepository;
    private DocumentRepository documentRepository;
    private InjectExpectationRepository injectExpectationExecutionRepository;

    @Autowired
    public void setArticleRepository(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Autowired
    public void setInjectExpectationExecutionRepository(InjectExpectationRepository injectExpectationExecutionRepository) {
        this.injectExpectationExecutionRepository = injectExpectationExecutionRepository;
    }

    @Autowired
    public void setMediaRepository(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping("/api/medias")
    public Iterable<Media> medias() {
        return mediaRepository.findAll();
    }

    @GetMapping("/api/medias/{mediaId}")
    public Media media(@PathVariable String mediaId) {
        return mediaRepository.findById(mediaId).orElseThrow();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/medias/{mediaId}")
    public Media updateMedia(@PathVariable String mediaId, @Valid @RequestBody MediaUpdateInput input) {
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        media.setUpdateAttributes(input);
        return mediaRepository.save(media);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/medias/{mediaId}/logos")
    public Media updateMediaLogos(@PathVariable String mediaId, @Valid @RequestBody MediaUpdateLogoInput input) {
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        if (input.getLogoDark() != null) {
            media.setLogoDark(documentRepository.findById(input.getLogoDark()).orElse(null));
        } else {
            media.setLogoDark(null);
        }
        if (input.getLogoLight() != null) {
            media.setLogoLight(documentRepository.findById(input.getLogoLight()).orElse(null));
        } else {
            media.setLogoLight(null);
        }
        return mediaRepository.save(media);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/medias")
    public Media createMedia(@Valid @RequestBody MediaCreateInput input) {
        Media media = new Media();
        media.setUpdateAttributes(input);
        return mediaRepository.save(media);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/medias/{mediaId}")
    public void deleteMedia(@PathVariable String mediaId) {
        mediaRepository.deleteById(mediaId);
    }

    private List<Article> enrichArticleWithVirtualPublication(Exercise exercise, List<Article> articles) {
        Instant now = Instant.now();
        Map<String, Instant> toPublishArticleIdsMap = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(MEDIA_PUBLISH))
                .filter(inject -> inject.getContent() != null)
                // TODO take into account depends_another here, depends_duration is not enough to order articles
                .sorted(Comparator.comparing(Inject::getDependsDuration))
                .flatMap(inject -> {
                    Instant virtualInjectDate = inject.computeInjectDate(now, SPEED_STANDARD);
                    try {
                        MediaContent content = mapper.treeToValue(inject.getContent(), MediaContent.class);
                        return content.getArticles().stream().map(article -> new VirtualArticle(virtualInjectDate, article));
                    } catch (JsonProcessingException e) {
                        // Invalid media content.
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
        article.setMedia(mediaRepository.findById(input.getMediaId()).orElseThrow());
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
    public Article updateArticle(@PathVariable String exerciseId, @PathVariable String articleId, @Valid @RequestBody ArticleUpdateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Article article = articleRepository.findById(articleId).orElseThrow();
        List<String> newDocumentsIds = input.getDocuments();
        List<String> currentDocumentIds = article.getDocuments().stream().map(Document::getId).toList();
        article.setMedia(mediaRepository.findById(input.getMediaId()).orElseThrow());
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
    public void deleteArticle(@PathVariable String articleId) {
        articleRepository.deleteById(articleId);
    }
    // endregion

    @GetMapping("/api/observer/medias/{exerciseId}/{mediaId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public MediaReader observerArticles(@PathVariable String exerciseId, @PathVariable String mediaId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        MediaReader mediaReader = new MediaReader(media, exercise);
        List<Article> publishedArticles = exercise.getArticlesForMedia(media);
        List<Article> articles = enrichArticleWithVirtualPublication(exercise, publishedArticles);
        mediaReader.setMediaArticles(articles);
        return mediaReader;
    }

    @GetMapping("/api/player/medias/{exerciseId}/{mediaId}")
    public MediaReader playerArticles(@PathVariable String exerciseId, @PathVariable String mediaId,
                                      @RequestParam Optional<String> userId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        final User user = userId.map(this::impersonateUser).orElse(currentUser());
        if (user.getId().equals(ANONYMOUS)) {
            throw new UnsupportedOperationException("User must be logged or dynamic player is required");
        }
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        MediaReader mediaReader = new MediaReader(media, exercise);
        Map<String, Instant> toPublishArticleIdsMap = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(MEDIA_PUBLISH))
                .filter(inject -> inject.getStatus().isPresent())
                .sorted(Comparator.comparing(inject -> inject.getStatus().get().getDate()))
                .flatMap(inject -> {
                    Instant virtualInjectDate = inject.getStatus().get().getDate();
                    try {
                        MediaContent content = mapper.treeToValue(inject.getContent(), MediaContent.class);
                        if (content.getArticles() != null) {
                            return content.getArticles().stream().map(article -> new VirtualArticle(virtualInjectDate, article));
                        }
                        return null;
                    } catch (JsonProcessingException e) {
                        // Invalid media content.
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toMap(VirtualArticle::id, VirtualArticle::date));
        if (toPublishArticleIdsMap.size() > 0) {
            List<Article> publishedArticles = fromIterable(articleRepository.findAllById(toPublishArticleIdsMap.keySet()))
                    .stream().filter(article -> article.getMedia().equals(media))
                    .peek(article -> article.setVirtualPublication(toPublishArticleIdsMap.get(article.getId())))
                    .sorted(Comparator.comparing(Article::getVirtualPublication).reversed())
                    .toList();
            mediaReader.setMediaArticles(publishedArticles);
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
        return mediaReader;
    }
}
