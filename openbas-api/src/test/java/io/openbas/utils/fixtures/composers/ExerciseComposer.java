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

    public class Composer {
        private Exercise exercise;
        private List<Inject> injects = new ArrayList<>();
        private List<LessonsCategory> categories = new ArrayList<>();
        private List<Team> teams = new ArrayList<>();
        private List<ArticleComposer.Composer> articleComposers = new ArrayList<>();
        private List<Objective> objectives = new ArrayList<>();
        private List<Tag> tags = new ArrayList<>();
        private List<Document> documents = new ArrayList<>();

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

        public Composer withLessonCategory(LessonsCategory category) {
            this.categories.add(category);
            List<LessonsCategory> tempCategories = this.exercise.getLessonsCategories();
            tempCategories.add(category);
            this.exercise.setLessonsCategories(tempCategories);
            return this;
        }

        public Composer withTeam(Team team) {
            this.teams.add(team);
            List<Team> tempTeams = this.exercise.getTeams();
            tempTeams.add(team);
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

        public Composer persist() {
            this.articleComposers.forEach(ArticleComposer.Composer::persist);
            exerciseRepository.save(exercise);
            return this;
        }
        public Exercise get() {
            return this.exercise;
        }
    }

    public Composer withExercise(Exercise exercise) {
        return new Composer(exercise);
    }
}