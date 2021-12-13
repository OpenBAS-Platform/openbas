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
@Table(name = "incidents")
public class Incident implements Base {
    @Id
    @Column(name = "incident_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("incident_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_type")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("incident_type")
    private IncidentType type;

    @ManyToOne
    @JoinColumn(name = "incident_event")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("incident_event")
    private Event event;

    @Column(name = "incident_title")
    @JsonProperty("incident_title")
    private String title;

    @Column(name = "incident_story")
    @JsonProperty("incident_story")
    private String story;

    @Column(name = "incident_weight")
    @JsonProperty("incident_weight")
    private Integer weight;

    @Column(name = "incident_order")
    @JsonProperty("incident_order")
    private Short order;

    @OneToMany(mappedBy = "incident", fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.SUBSELECT)
    @JsonProperty("incident_injects")
    private List<Inject<?>> injects = new ArrayList<>();

    @OneToOne(mappedBy = "incident")
    @JsonProperty("incident_outcome")
    private Outcome outcome;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "incidents_subobjectives",
            joinColumns = @JoinColumn(name = "incident_id"),
            inverseJoinColumns = @JoinColumn(name = "subobjective_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("incident_subobjectives")
    private List<SubObjective> subObjectives = new ArrayList<>();

    // region transient
    @JsonProperty("incident_exercise")
    public String getExerciseId() {
        return getEvent().getExercise().getId();
    }
    // endregion

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public IncidentType getType() {
        return type;
    }

    public void setType(IncidentType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStory() {
        return story;
    }

    public void setStory(String story) {
        this.story = story;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Short getOrder() {
        return order;
    }

    public void setOrder(Short order) {
        this.order = order;
    }

    public List<Inject<?>> getInjects() {
        return injects;
    }

    public void setInjects(List<Inject<?>> injects) {
        this.injects = injects;
    }

    public Outcome getOutcome() {
        return outcome;
    }

    public void setOutcome(Outcome outcome) {
        this.outcome = outcome;
    }

    public List<SubObjective> getSubObjectives() {
        return subObjectives;
    }

    public void setSubObjectives(List<SubObjective> subObjectives) {
        this.subObjectives = subObjectives;
    }
}
