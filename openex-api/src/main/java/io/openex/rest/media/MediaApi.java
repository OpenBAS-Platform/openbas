package io.openex.rest.media;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.injects.media.model.MediaContent;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.inject.form.InjectDocumentInput;
import io.openex.rest.media.form.*;
import io.openex.rest.media.model.VirtualArticle;
import io.openex.rest.media.response.MediaReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
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
    private ArticleDocumentRepository articleDocumentRepository;
    private UserRepository userRepository;
    private MediaRepository mediaRepository;
    private DocumentRepository documentRepository;
    private InjectExpectationRepository injectExpectationExecutionRepository;

    @Autowired
    public void setArticleRepository(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Autowired
    public void setArticleDocumentRepository(ArticleDocumentRepository articleDocumentRepository) {
        this.articleDocumentRepository = articleDocumentRepository;
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
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        List<ArticleDocument> articleDocuments = new ArrayList<>(article.getDocuments());
        List<ArticleDocumentInput> documents = input.getDocuments();
        documents.forEach(in -> {
            Optional<Document> doc = documentRepository.findById(in.getDocumentId());
            if (doc.isPresent()) {
                ArticleDocument articleDocument = new ArticleDocument();
                articleDocument.setArticle(article);
                Document document = doc.get();
                articleDocument.setDocument(document);
                ArticleDocument savedArticleDoc = articleDocumentRepository.save(articleDocument);
                articleDocuments.add(savedArticleDoc);
                // If Document not yet linked directly to the exercise, attached it
                if (!document.getExercises().contains(exercise)) {
                    exercise.getDocuments().add(document);
                    exerciseRepository.save(exercise);
                }
            }
        });
        Article savedArticle = articleRepository.save(article);
        return enrichArticleWithVirtualPublication(exercise, savedArticle);
    }

    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @PutMapping("/api/exercises/{exerciseId}/articles/{articleId}")
    public Article updateArticle(@PathVariable String exerciseId, @PathVariable String articleId, @Valid @RequestBody ArticleUpdateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Article article = articleRepository.findById(articleId).orElseThrow();
        List<ArticleDocumentInput> documents = input.getDocuments();
        List<String> askedDocumentIds = documents.stream().map(ArticleDocumentInput::getDocumentId).toList();
        List<String> currentDocumentIds = article.getDocuments().stream().map(document -> document.getDocument().getId()).toList();
        article.setMedia(mediaRepository.findById(input.getMediaId()).orElseThrow());
        article.setUpdateAttributes(input);
        // region Set documents
        List<ArticleDocument> articleDocuments = new ArrayList<>(article.getDocuments());
        // To delete
        article.getDocuments().stream().filter(articleDoc -> !askedDocumentIds.contains(articleDoc.getDocument().getId())).forEach(articleDoc -> {
            articleDocuments.remove(articleDoc);
            articleDocumentRepository.delete(articleDoc);
        });
        // To add
        documents.stream().filter(doc -> !currentDocumentIds.contains(doc.getDocumentId())).forEach(in -> {
            Optional<Document> doc = documentRepository.findById(in.getDocumentId());
            if (doc.isPresent()) {
                ArticleDocument articleDocument = new ArticleDocument();
                articleDocument.setArticle(article);
                Document document = doc.get();
                articleDocument.setDocument(document);
                ArticleDocument savedArticleDoc = articleDocumentRepository.save(articleDocument);
                articleDocuments.add(savedArticleDoc);
                // If Document not yet linked directly to the exercise, attached it
                if (!document.getExercises().contains(exercise)) {
                    exercise.getDocuments().add(document);
                    exerciseRepository.save(exercise);
                }
            }
        });
        Article savedArticle = articleRepository.save(article);
        return enrichArticleWithVirtualPublication(exercise, savedArticle);
    }

    @PreAuthorize("isExerciseObserver(#exerciseId)")
    @GetMapping("/api/exercises/{exerciseId}/articles")
    public Iterable<Article> exerciseArticles(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        return enrichArticleWithVirtualPublication(exercise, exercise.getArticles());
    }

    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @DeleteMapping("/api/exercises/{exerciseId}/articles/{articleId}")
    public void deleteArticle(@PathVariable String articleId) {
        articleRepository.deleteById(articleId);
    }
    // endregion

    // --- Open media access
    private User impersonateUser(String userId) {
        User user = currentUser();
        if (user.getId().equals(ANONYMOUS)) {
            user = userRepository.findById(userId).orElseThrow();
            if (!user.getId().equals(userId) || !user.isOnlyPlayer()) {
                throw new UnsupportedOperationException("Only player can be impersonate");
            }
        }
        return user;
    }

    @GetMapping("/api/planner/medias/{exerciseId}/{mediaId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public MediaReader plannerArticles(@PathVariable String exerciseId, @PathVariable String mediaId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        // Fulfill visible article expectations
        MediaReader mediaReader = new MediaReader(exercise.getStatus(), media);
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
        MediaReader mediaReader = new MediaReader(exercise.getStatus(), media);
        Map<String, Instant> toPublishArticleIdsMap = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(MEDIA_PUBLISH))
                .filter(inject -> inject.getStatus().isPresent())
                .sorted(Comparator.comparing(inject -> inject.getStatus().get().getDate()))
                .flatMap(inject -> {
                    Instant virtualInjectDate = inject.getStatus().get().getDate();
                    try {
                        MediaContent content = mapper.treeToValue(inject.getContent(), MediaContent.class);
                        return content.getArticles().stream().map(article -> new VirtualArticle(virtualInjectDate, article));
                    } catch (JsonProcessingException e) {
                        // Invalid media content.
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(VirtualArticle::id, VirtualArticle::date));
        if (toPublishArticleIdsMap.size() > 0) {
            List<Article> publishedArticles = fromIterable(articleRepository.findAllById(toPublishArticleIdsMap.keySet()))
                    .stream().peek(article -> article.setVirtualPublication(toPublishArticleIdsMap.get(article.getId()))).toList();
            mediaReader.setMediaArticles(publishedArticles);
            // Fulfill article expectations
            List<InjectExpectation> expectationExecutions = publishedArticles.stream()
                    .flatMap(article -> exercise.getInjects().stream()
                            .flatMap(inject -> inject.getUserExpectationsForArticle(user, article).stream()))
                    .filter(exec -> exec.getResult() == null).toList();
            expectationExecutions.forEach(injectExpectationExecution -> {
                injectExpectationExecution.setUser(user);
                injectExpectationExecution.setResult(Instant.now().toString());
                injectExpectationExecutionRepository.save(injectExpectationExecution);
            });
        }
        return mediaReader;
    }
}
