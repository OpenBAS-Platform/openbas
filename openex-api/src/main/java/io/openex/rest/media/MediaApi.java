package io.openex.rest.media;

import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.helper.UserHelper;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.media.form.ArticleCreateInput;
import io.openex.rest.media.form.MediaCreateInput;
import io.openex.rest.media.form.MediaUpdateInput;
import io.openex.rest.media.response.MediaReader;
import io.openex.rest.tag.form.TagCreateInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.time.Instant;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;
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
    public Media updateMedia(@PathVariable String mediaId,
                             @Valid @RequestBody MediaUpdateInput input) {
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
    @PostMapping("/api/articles")
    public MediaArticle createArticle(@Valid @RequestBody ArticleCreateInput input) {
        MediaArticle article = new MediaArticle();
        article.setUpdateAttributes(input);
        return articleRepository.save(article);
    }
    // endregion

    // --- Open media access

    @GetMapping("/api/media-reader/{mediaId}/{userId}/{exerciseId}")
    public MediaReader mediaReader(@PathVariable String exerciseId, @PathVariable String userId, @PathVariable String mediaId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        Media media = mediaRepository.findById(mediaId).orElseThrow();
        // Fulfill visible article expectations
        MediaReader mediaReader = new MediaReader(exercise.getStatus(), media);
        if (exercise.getStatus().equals(Exercise.STATUS.RUNNING)) {
            List<MediaArticle> articlesForMedia = exercise.getArticlesForMedia(media);
            List<MediaArticle> publishedArticles = articlesForMedia.stream().filter(MediaArticle::isPublished).toList();
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
