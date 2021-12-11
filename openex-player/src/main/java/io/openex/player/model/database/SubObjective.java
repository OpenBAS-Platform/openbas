package io.openex.player.model.database;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.player.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name = "subobjectives")
public class SubObjective implements Base {
    @Id
    @Column(name = "subobjective_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("subobjective_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "subobjective_objective")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("subobjective_objective")
    private Objective objective;

    @Column(name = "subobjective_title")
    @JsonProperty("subobjective_title")
    private String title;

    @Column(name = "subobjective_description")
    @JsonProperty("subobjective_description")
    private String description;

    @Column(name = "subobjective_priority")
    @JsonProperty("subobjective_priority")
    private Short priority;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Objective getObjective() {
        return objective;
    }

    public void setObjective(Objective objective) {
        this.objective = objective;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Short getPriority() {
        return priority;
    }

    public void setPriority(Short priority) {
        this.priority = priority;
    }
}
