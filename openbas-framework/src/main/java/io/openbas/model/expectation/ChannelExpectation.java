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
  private String name;
  private Long expirationTime;


  public ChannelExpectation(io.openbas.model.inject.form.Expectation expectation, Article article) {
    setScore(Objects.requireNonNullElse(score, 100.0));
    setArticle(article);
    setName(article.getName());
    setExpectationGroup(expectation.isExpectationGroup());
    setExpirationTime(expectation.getExpirationTime());
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.ARTICLE;
  }

}
