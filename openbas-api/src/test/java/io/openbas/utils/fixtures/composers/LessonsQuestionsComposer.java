package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.LessonsQuestion;
import io.openbas.database.repository.LessonsQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class LessonsQuestionsComposer {

  @Autowired private LessonsQuestionRepository lessonsQuestionRepository;

  public class Composer extends InnerComposerBase<LessonsQuestion> {
    private final LessonsQuestion lessonsQuestion;

    public Composer(LessonsQuestion lessonsQuestion) {
      this.lessonsQuestion = lessonsQuestion;
    }

    @Override
    public InnerComposerBase<LessonsQuestion> persist() {
      lessonsQuestionRepository.save(lessonsQuestion);
      return this;
    }

    @Override
    public LessonsQuestion get() {
      return this.lessonsQuestion;
    }
  }

  public Composer forLessonsQuestion(LessonsQuestion lessonsQuestion) {
    return new Composer(lessonsQuestion);
  }
}
