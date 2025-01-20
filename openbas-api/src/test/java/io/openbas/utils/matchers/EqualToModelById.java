package io.openbas.utils.matchers;

import io.openbas.database.model.Base;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

public class EqualToModelById<T extends Base> extends TypeSafeMatcher<T> {
  private final T expected;

  public EqualToModelById(T expected) {
    this.expected = expected;
  }

  @Override
  protected boolean matchesSafely(T actual) {
    return actual.getId().equals(expected.getId());
  }

  @Override
  public void describeTo(Description description) {
    description.appendText("is not equal to %s".formatted(expected));
  }

  public static Matcher<Base> equalsToModelById(Base expected) {
    return new EqualToModelById<>(expected);
  }
}
