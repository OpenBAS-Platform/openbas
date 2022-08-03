package io.openex.model.expectation;

import io.openex.database.model.Article;
import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;

import java.util.Objects;

public class MediaExpectation implements Expectation {
    private Integer score;
    private Article article;

    public MediaExpectation(Integer score, Article article) {
        setScore(Objects.requireNonNullElse(score, 100));
        setArticle(article);
    }

    @Override
    public InjectExpectation.EXPECTATION_TYPE type() {
        return InjectExpectation.EXPECTATION_TYPE.ARTICLE;
    }

    @Override
    public Integer score() {
        return score;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }
}
