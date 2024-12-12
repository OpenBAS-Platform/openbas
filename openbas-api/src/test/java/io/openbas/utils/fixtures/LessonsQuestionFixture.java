package io.openbas.utils.fixtures;

import io.openbas.database.model.LessonsQuestion;

public class LessonsQuestionFixture {

  public static LessonsQuestion createLessonsQuestion() {
    LessonsQuestion lessonsQuestion = new LessonsQuestion();
    lessonsQuestion.setContent("Question content");
    lessonsQuestion.setExplanation("Explanation");
    lessonsQuestion.setOrder(0);
    return lessonsQuestion;
  }
}
