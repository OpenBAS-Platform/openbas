package io.openex.model.expectation;

import io.openex.database.model.Article;
import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class ChannelExpectation implements Expectation {

  private Integer score;
  private Article article;

  public ChannelExpectation(Integer score, Article article) {
    setScore(Objects.requireNonNullElse(score, 100));
    setArticle(article);
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.ARTICLE;
  }

}
