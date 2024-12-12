package io.openbas.utils.fixtures;

import io.openbas.database.model.LessonsCategory;

public class LessonsCategoryFixture {

  public static final String CATEGORY_NAME = "Category test";

  public static LessonsCategory createLessonCategory() {
    LessonsCategory lessonCategory = new LessonsCategory();
    lessonCategory.setName(CATEGORY_NAME);
    lessonCategory.setDescription("This is a description");
    lessonCategory.setOrder(1);
    return lessonCategory;
  }
}
