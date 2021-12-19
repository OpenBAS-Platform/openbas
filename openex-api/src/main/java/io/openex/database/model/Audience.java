package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "audiences")
public class Audience implements Base {
    @Id
    @Column(name = "audience_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("audience_id")
    private String id;

    @Column(name = "audience_name")
    @JsonProperty("audience_name")
    private String name;

    @Column(name = "audience_enabled")
    @JsonProperty("audience_enabled")
    private boolean enabled;

    @ManyToOne
    @JoinColumn(name = "audience_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("audience_exercise")
    private Exercise exercise;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_audiences",
            joinColumns = @JoinColumn(name = "audience_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("subaudience_users")
    @Fetch(FetchMode.SUBSELECT)
    private List<User> users = new ArrayList<>();

    @JsonProperty("audience_users_number")
    public long getUsersNumber() {
        return getUsers().size();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }
}
