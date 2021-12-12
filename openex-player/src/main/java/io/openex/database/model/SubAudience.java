package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subaudiences")
public class SubAudience implements Base {
    @Id
    @Column(name = "subaudience_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("subaudience_id")
    private String id;

    @Column(name = "subaudience_name")
    @JsonProperty("subaudience_name")
    private String name;

    @Column(name = "subaudience_enabled")
    @JsonProperty("subaudience_enabled")
    private boolean enabled;

    @ManyToOne
    @JoinColumn(name = "subaudience_audience")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("subaudience_audience")
    private Audience audience;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_subaudiences",
            joinColumns = @JoinColumn(name = "subaudience_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("subaudience_users")
    private List<User> users = new ArrayList<>();

    // region transient
    @JsonProperty("subaudience_exercise")
    public String getExercise() {
        return getAudience().getExercise().getId();
    }

    // @JsonProperty("subaudience_injects")
    // public List<Inject<?>> getInjects() {
    //     return getAudience().getExercise().getEvents().stream()
    //             .flatMap(event -> event.getIncidents().stream())
    //             .flatMap(incident -> incident.getInjects().stream())
    //             .toList();
    // }
    // endregion

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

    public Audience getAudience() {
        return audience;
    }

    public void setAudience(Audience audience) {
        this.audience = audience;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }
}
