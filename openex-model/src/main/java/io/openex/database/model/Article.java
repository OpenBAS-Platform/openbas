package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "articles")
@EntityListeners(ModelBaseListener.class)
public class Article implements Base {
    @Id
    @Column(name = "article_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("article_id")
    private String id;

    @Column(name = "article_created_at")
    @JsonProperty("article_created_at")
    private Instant createdAt = now();

    @Column(name = "article_updated_at")
    @JsonProperty("article_updated_at")
    private Instant updatedAt = now();

    @Column(name = "article_name")
    @JsonProperty("article_name")
    private String name;

    @Column(name = "article_content")
    @JsonProperty("article_content")
    private String content;

    @Column(name = "article_author")
    @JsonProperty("article_author")
    private String author;

    @Column(name = "article_shares")
    @JsonProperty("article_shares")
    private Integer shares;

    @Column(name = "article_likes")
    @JsonProperty("article_likes")
    private Integer likes;

    @Column(name = "article_comments")
    @JsonProperty("article_comments")
    private Integer comments;

    @ManyToOne
    @JoinColumn(name = "article_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("article_exercise")
    private Exercise exercise;

    @ManyToOne
    @JoinColumn(name = "article_media")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("article_media")
    private Media media;

    @OneToMany(mappedBy = "article", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonProperty("article_documents")
    @Fetch(FetchMode.SUBSELECT)
    private List<ArticleDocument> documents = new ArrayList<>();

    @JsonIgnore
    @Override
    public boolean isUserHasAccess(User user) {
        return getExercise().isUserHasAccess(user);
    }

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Integer getShares() {
        return shares;
    }

    public void setShares(Integer shares) {
        this.shares = shares;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
    }

    public Integer getComments() {
        return comments;
    }

    public void setComments(Integer comments) {
        this.comments = comments;
    }

    public List<ArticleDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(List<ArticleDocument> documents) {
        this.documents = documents;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public Media getMedia() {
        return media;
    }

    public void setMedia(Media media) {
        this.media = media;
    }

    @Transient
    private Instant virtualPublication;

    @JsonProperty("article_virtual_publication")
    public Instant getVirtualPublication() {
        return virtualPublication;
    }

    public void setVirtualPublication(Instant virtualPublication) {
        this.virtualPublication = virtualPublication;
    }

    @JsonProperty("article_is_scheduled")
    public boolean isScheduledPublication() {
        return virtualPublication != null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !Base.class.isAssignableFrom(o.getClass())) return false;
        Base base = (Base) o;
        return id.equals(base.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
