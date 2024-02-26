package io.openex.rest.utils.fixtures;

import io.openex.database.model.Article;
import io.openex.database.model.Channel;
import jakarta.validation.constraints.NotNull;

public class ArticleFixture {

  public static final String ARTICLE_NAME = "An article";

  public static Article getArticle(@NotNull final Channel channel) {
    Article article = new Article();
    article.setName(ARTICLE_NAME);
    article.setContent("Lorem");
    article.setChannel(channel);
    return article;
  }

}
