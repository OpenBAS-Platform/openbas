package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Article;
import io.openbas.database.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ArticleComposer extends ComposerBase<Article> {
  @Autowired private ArticleRepository articleRepository;

  public class Composer extends InnerComposerBase<Article> {
    private final Article article;
    private ChannelComposer.Composer channelComposer;

    public Composer(Article article) {
      this.article = article;
    }

    public Composer withChannel(ChannelComposer.Composer channelComposer) {
      this.channelComposer = channelComposer;
      this.article.setChannel(channelComposer.get());
      return this;
    }

    public Composer withId(String id) {
      this.article.setId(id);
      return this;
    }

    @Override
    public Composer persist() {
      this.channelComposer.persist();
      articleRepository.save(article);
      return this;
    }

    @Override
    public Article get() {
      return article;
    }
  }

  public Composer forArticle(Article article) {
    generatedItems.add(article);
    return new Composer(article);
  }
}
