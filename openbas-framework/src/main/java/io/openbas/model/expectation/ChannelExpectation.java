package io.openbas.model.expectation;

import io.openbas.database.model.Article;
import io.openbas.database.model.InjectExpectation;
import io.openbas.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class ChannelExpectation implements Expectation {

  private Double score;
  private Article article;
  private boolean expectationGroup;

  public ChannelExpectation(Double score, Article article) {
    setScore(Objects.requireNonNullElse(score, 100.0));
    setArticle(article);
  }

  public ChannelExpectation(Double score, Article article, boolean expectationGroup) {
    setScore(Objects.requireNonNullElse(score, 100.0));
    setArticle(article);
    setExpectationGroup(expectationGroup);
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.ARTICLE;
  }

}
