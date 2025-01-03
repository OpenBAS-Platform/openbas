package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Article;
import io.openbas.database.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ArticleComposer {
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

    public Composer withArticle(Article article) {
        return new Composer(article);
    }
}
