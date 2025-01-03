package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.*;
import io.openbas.database.model.Article;
import io.openbas.database.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class ExerciseComposer {
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private InjectRepository injectRepository;
    @Autowired private ArticleRepository articleRepository;
    @Autowired private LessonsCategoryRepository lessonsCategoryRepository;
    @Autowired private ObjectiveRepository objectiveRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private DocumentRepository documentRepository;

    public class Composer extends InnerComposerBase<Exercise> {
        private final Exercise exercise;
        private final List<Inject> injects = new ArrayList<>();
        private final List<LessonsCategoryComposer.Composer> categoryComposers = new ArrayList<>();
        private final List<TeamComposer.Composer> teamComposers = new ArrayList<>();
        private final List<ArticleComposer.Composer> articleComposers = new ArrayList<>();
        private final List<Objective> objectives = new ArrayList<>();
        private final List<Tag> tags = new ArrayList<>();
        private final List<Document> documents = new ArrayList<>();

        public Composer(Exercise exercise) {
            this.exercise = exercise;
        }

        public Composer withInject (Inject inject) {
            injects.add(inject);
            List<Inject> injects = exercise.getInjects();
            injects.add(inject);
            this.exercise.setInjects(injects);
            return this;
        }

        public Composer withLessonCategory(LessonsCategoryComposer.Composer categoryComposer) {
            this.categoryComposers.add(categoryComposer);
            List<LessonsCategory> tempCategories = this.exercise.getLessonsCategories();
            tempCategories.add(categoryComposer.get());
            this.exercise.setLessonsCategories(tempCategories);
            return this;
        }

        public Composer withTeam(TeamComposer.Composer teamComposer) {
            this.teamComposers.add(teamComposer);
            List<Team> tempTeams = this.exercise.getTeams();
            tempTeams.add(teamComposer.get());
            this.exercise.setTeams(tempTeams);
            return this;
        }

        public Composer withArticle(ArticleComposer.Composer articleComposer) {
            this.articleComposers.add(articleComposer);
            List<Article> tempArticles = this.exercise.getArticles();
            tempArticles.add(articleComposer.get());
            this.exercise.setArticles(tempArticles);
            return this;
        }

        public Composer withObjective(Objective objective) {
            this.objectives.add(objective);
            List<Objective> tempObjectives = this.exercise.getObjectives();
            tempObjectives.add(objective);
            this.exercise.setObjectives(tempObjectives);
            return this;
        }
        public Composer withTag(Tag tag) {
            this.tags.add(tag);
            Set<Tag> tempTags = this.exercise.getTags();
            tempTags.add(tag);
            this.exercise.setTags(tempTags);
            return this;
        }

        public Composer withDocument(Document document) {
            this.documents.add(document);
            List<Document> tempDocuments = this.exercise.getDocuments();
            tempDocuments.add(document);
            this.exercise.setDocuments(tempDocuments);
            return this;
        }

        @Override
        public Composer persist() {
            this.articleComposers.forEach(ArticleComposer.Composer::persist);
            this.categoryComposers.forEach(LessonsCategoryComposer.Composer::persist);
            this.teamComposers.forEach(TeamComposer.Composer::persist);
            exerciseRepository.save(exercise);
            return this;
        }

        @Override
        public Exercise get() {
            return this.exercise;
        }
    }

    public Composer withExercise(Exercise exercise) {
        return new Composer(exercise);
    }
}