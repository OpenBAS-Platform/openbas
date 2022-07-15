package io.openex.rest.media;

import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.media.form.ArticleCreateInput;
import io.openex.rest.media.form.ArticleUpdateInput;
import io.openex.rest.media.form.MediaCreateInput;
import io.openex.rest.media.form.MediaUpdateInput;
import io.openex.rest.media.response.MediaReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.time.Instant;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.UserHelper.ANONYMOUS;
import static io.openex.helper.UserHelper.currentUser;

@RestController
public class MediaApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ArticleRepository articleRepository;
    private UserRepository userRepository;
    private MediaRepository mediaRepository;
    private InjectExpectationExecutionRepository injectExpectationExecutionRepository;

    @Autowired
    public void setArticleRepository(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Autowired
    public void setInjectExpectationExecutionRepository(InjectExpectationExecutionRepository injectExpectationExecutionRepository) {
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

    @GetMapping("/api/medias")
    public Iterable<Media> medias() {
        return mediaRepository.findAll();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/medias/{mediaId}")
    public Media updateMedia(@PathVariable String mediaId, @Valid @RequestBody MediaUpdateInput input) {
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        media.setUpdateAttributes(input);
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

    @GetMapping("/api/medias/{mediaId}/{exerciseId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public MediaReader media(@PathVariable String exerciseId, @PathVariable String mediaId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        MediaReader mediaReader = new MediaReader(exercise.getStatus(), media);
        mediaReader.setMediaArticles(exercise.getArticlesForMedia(media));
        return mediaReader;
    }

    // region articles
    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/exercises/{exerciseId}/articles")
    public Article createArticle(@PathVariable String exerciseId, @Valid @RequestBody ArticleCreateInput input) {
        Article article = new Article();
        article.setUpdateAttributes(input);
        article.setMedia(mediaRepository.findById(input.getMediaId()).orElseThrow());
        article.setExercise(exerciseRepository.findById(exerciseId).orElseThrow());
        return articleRepository.save(article);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/articles/{articleId}")
    public Article updateArticle(@PathVariable String articleId, @Valid @RequestBody ArticleUpdateInput input) {
        Article article = articleRepository.findById(articleId).orElseThrow();
        article.setMedia(mediaRepository.findById(input.getMediaId()).orElseThrow());
        article.setUpdateAttributes(input);
        return articleRepository.save(article);
    }

    @PreAuthorize("isExerciseObserver(#exerciseId)")
    @GetMapping("/api/exercises/{exerciseId}/articles")
    public Iterable<Article> exerciseArticles(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        return exercise.getArticles();
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/articles/{articleId}")
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

    @GetMapping("/api/media-reader/{exerciseId}/{mediaId}")
    public MediaReader mediaReader(@PathVariable String exerciseId, @PathVariable String mediaId, @RequestParam String userId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        final User user = impersonateUser(userId);
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        // Fulfill visible article expectations
        MediaReader mediaReader = new MediaReader(exercise.getStatus(), media);
        if (user.isManager() || exercise.getStatus().equals(Exercise.STATUS.RUNNING)) {
            List<Article> articlesForMedia = exercise.getArticlesForMedia(media);
            List<Article> publishedArticles = articlesForMedia.stream().filter(Article::isPublished).toList();
            List<InjectExpectationExecution> expectationExecutions = publishedArticles.stream()
                    .flatMap(article -> exercise.getInjects()
                            .stream().flatMap(inject -> inject.getUserExpectationsForArticle(user, article)
                                    .stream())).toList();
            expectationExecutions.forEach(injectExpectationExecution -> {
                injectExpectationExecution.setResult(Instant.now().toString());
                injectExpectationExecutionRepository.save(injectExpectationExecution);
            });
            mediaReader.setMediaArticles(publishedArticles);
        }
        return mediaReader;
    }
}
