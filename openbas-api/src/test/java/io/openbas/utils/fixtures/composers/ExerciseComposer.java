package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.*;
import io.openbas.database.model.Article;
import io.openbas.database.repository.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ExerciseComposer {
  @Autowired private ExerciseRepository exerciseRepository;

  public class Composer extends InnerComposerBase<Exercise> {
    private final Exercise exercise;
    private final List<InjectComposer.Composer> injectComposers = new ArrayList<>();
    private final List<LessonsCategoryComposer.Composer> categoryComposers = new ArrayList<>();
    private final List<TeamComposer.Composer> teamComposers = new ArrayList<>();
    private final List<ArticleComposer.Composer> articleComposers = new ArrayList<>();
    private final List<ObjectiveComposer.Composer> objectiveComposers = new ArrayList<>();
    private final List<TagComposer.Composer> tagComposers = new ArrayList<>();
    private final List<DocumentComposer.Composer> documentComposers = new ArrayList<>();

    public Composer(Exercise exercise) {
      this.exercise = exercise;
    }

    public Composer withInject(InjectComposer.Composer injectComposer) {
      injectComposers.add(injectComposer);
      List<Inject> injects = exercise.getInjects();
      injects.add(injectComposer.get());
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

    public Composer withObjective(ObjectiveComposer.Composer objectiveComposer) {
      this.objectiveComposers.add(objectiveComposer);
      List<Objective> tempObjectives = this.exercise.getObjectives();
      tempObjectives.add(objectiveComposer.get());
      this.exercise.setObjectives(tempObjectives);
      return this;
    }

    public Composer withTag(TagComposer.Composer tagComposer) {
      this.tagComposers.add(tagComposer);
      Set<Tag> tempTags = this.exercise.getTags();
      tempTags.add(tagComposer.get());
      this.exercise.setTags(tempTags);
      return this;
    }

    public Composer withDocument(DocumentComposer.Composer documentComposer) {
      this.documentComposers.add(documentComposer);
      List<Document> tempDocuments = this.exercise.getDocuments();
      tempDocuments.add(documentComposer.get());
      this.exercise.setDocuments(tempDocuments);
      return this;
    }

    @Override
    public Composer persist() {
      this.articleComposers.forEach(ArticleComposer.Composer::persist);
      this.categoryComposers.forEach(LessonsCategoryComposer.Composer::persist);
      this.teamComposers.forEach(TeamComposer.Composer::persist);
      this.injectComposers.forEach(InjectComposer.Composer::persist);
      this.objectiveComposers.forEach(ObjectiveComposer.Composer::persist);
      this.tagComposers.forEach(TagComposer.Composer::persist);
      this.documentComposers.forEach(DocumentComposer.Composer::persist);
      exerciseRepository.save(exercise);
      return this;
    }

    @Override
    public Exercise get() {
      return this.exercise;
    }
  }

  public Composer forExercise(Exercise exercise) {
    return new Composer(exercise);
  }
}