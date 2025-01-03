package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.LessonsCategory;
import io.openbas.database.model.LessonsQuestion;
import io.openbas.database.repository.LessonsCategoryRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class LessonsCategoryComposer {

  @Autowired private LessonsCategoryRepository lessonsCategoryRepository;

  public class Composer extends InnerComposerBase<LessonsCategory> {
    private final LessonsCategory lessonsCategory;
    private final List<LessonsQuestionsComposer.Composer> lessonsQuestionComposers =
        new ArrayList<>();

    public Composer(LessonsCategory lessonsCategory) {
      this.lessonsCategory = lessonsCategory;
    }

        public Composer withLessonsQuestion(LessonsQuestionsComposer.Composer lessonsQuestionComposer) {
            lessonsQuestionComposers.add(lessonsQuestionComposer);
            return this;
        }

    @Override
    public Composer persist() {
        //lessonsCategory.setQuestions(lessonsQuestionComposers.stream().map(LessonsQuestionsComposer.Composer::get).toList());
      lessonsCategoryRepository.save(lessonsCategory);
      lessonsQuestionComposers.forEach(composer -> {
         composer.get().setCategory(lessonsCategory);
         composer.persist();
      });
      return this;
    }

    @Override
    public LessonsCategory get() {
      return lessonsCategory;
    }
  }

  public Composer forLessonsCategory(LessonsCategory lessonsCategory) {
    return new Composer(lessonsCategory);
  }
}
