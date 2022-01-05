package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "logs")
@EntityListeners(ModelBaseListener.class)
public class ExerciseLog implements Base {
    @Id
    @Column(name = "log_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("log_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "log_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("log_exercise")
    private Exercise exercise;

    @ManyToOne
    @JoinColumn(name = "log_user")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("log_user")
    private User user;

    @Column(name = "log_title")
    @JsonProperty("log_title")
    private String title;

    @Column(name = "log_content")
    @JsonProperty("log_content")
    private String content;

    @Column(name = "log_date")
    @JsonProperty("log_date")
    private Date date;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
