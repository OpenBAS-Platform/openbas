package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.LessonsCategory;
import io.openbas.database.model.LessonsQuestion;
import io.openbas.database.repository.LessonsCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class LessonsCategoryComposer {

    @Autowired private LessonsCategoryRepository lessonsCategoryRepository;

    public class Composer extends InnerComposerBase<LessonsCategory> {
        private final LessonsCategory lessonsCategory;
        private final List<LessonsQuestionsComposer.Composer> lessonsQuestionComposers = new ArrayList<>();

        public Composer(LessonsCategory lessonsCategory) {
            this.lessonsCategory = lessonsCategory;
        }

        public Composer withLessonsQuestion(LessonsQuestionsComposer.Composer lessonsQuestionComposer) {
            lessonsQuestionComposers.add(lessonsQuestionComposer);
            List<LessonsQuestion> tempQuestions = this.lessonsCategory.getQuestions();
            tempQuestions.add(lessonsQuestionComposer.get());
            this.lessonsCategory.setQuestions(tempQuestions);
            return this;
        }

        @Override
        public InnerComposerBase<LessonsCategory> persist() {
            lessonsQuestionComposers.forEach(LessonsQuestionsComposer.Composer::persist);
            lessonsCategoryRepository.save(lessonsCategory);
            return this;
        }

        @Override
        public LessonsCategory get() {
            return lessonsCategory;
        }
    }

    public Composer withLessonsCategory(LessonsCategory lessonsCategory) {
        return new Composer(lessonsCategory);
    }

}
