package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "reports")
@EntityListeners(ModelBaseListener.class)
public class Report implements Base {
    @Id
    @Column(name = "report_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("report_id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_exercise")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("report_exercise")
    private Exercise exercise;

    @Column(name = "report_created_at")
    @JsonProperty("report_created_at")
    private Instant created = now();

    @Column(name = "report_updated_at")
    @JsonProperty("report_updated_at")
    private Instant updated = now();

    @Column(name = "report_name")
    @JsonProperty("report_name")
    private String name;

    @Column(name = "report_description")
    @JsonProperty("report_description")
    private String description;

    @Column(name = "report_general_information")
    @JsonProperty("report_general_information")
    private boolean generalInformation;

    @Column(name = "report_stats_definition")
    @JsonProperty("report_stats_definition")
    private boolean statsDefinition;

    @Column(name = "report_stats_definition_score")
    @JsonProperty("report_stats_definition_score")
    private boolean statsDefinitionScore;

    @Column(name = "report_stats_data")
    @JsonProperty("report_stats_data")
    private boolean statsData;

    @Column(name = "report_stats_results")
    @JsonProperty("report_stats_results")
    private boolean statsResults;

    @Column(name = "report_lessons_stats")
    @JsonProperty("report_lessons_stats")
    private boolean lessonsStats;

    @Column(name = "report_lessons_details")
    @JsonProperty("report_lessons_details")
    private boolean lessonsDetails;

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

    public Instant getCreated() {
        return created;
    }

    public void setCreated(Instant created) {
        this.created = created;
    }

    public Instant getUpdated() {
        return updated;
    }

    public void setUpdated(Instant updated) {
        this.updated = updated;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isStatsDefinition() {
        return statsDefinition;
    }

    public void setStatsDefinition(boolean statsDefinition) {
        this.statsDefinition = statsDefinition;
    }

    public boolean isStatsDefinitionScore() {
        return statsDefinitionScore;
    }

    public void setStatsDefinitionScore(boolean statsDefinitionScore) {
        this.statsDefinitionScore = statsDefinitionScore;
    }

    public boolean isStatsData() {
        return statsData;
    }

    public void setStatsData(boolean statsData) {
        this.statsData = statsData;
    }

    public boolean isStatsResults() {
        return statsResults;
    }

    public void setStatsResults(boolean statsResults) {
        this.statsResults = statsResults;
    }

    public boolean isLessonsStats() {
        return lessonsStats;
    }

    public void setLessonsStats(boolean lessonsStats) {
        this.lessonsStats = lessonsStats;
    }

    public boolean isLessonsDetails() {
        return lessonsDetails;
    }

    public void setLessonsDetails(boolean lessonsDetails) {
        this.lessonsDetails = lessonsDetails;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return getExercise().isUserHasAccess(user);
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
