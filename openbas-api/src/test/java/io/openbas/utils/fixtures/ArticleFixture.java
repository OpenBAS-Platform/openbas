package io.openbas.utils.fixtures;

import io.openbas.database.model.Article;
import io.openbas.database.model.Channel;
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

  public static Article getArticleNoChannel() {
    Article article = new Article();
    article.setName(ARTICLE_NAME);
    article.setContent("Lorem");
    return article;
  }
}
