package io.openex.rest.report.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class ReportUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("report_name")
    private String name;

    @JsonProperty("report_description")
    private String description;

    @JsonProperty("report_general_information")
    private boolean generalInformation;

    @JsonProperty("report_stats_definition")
    private boolean statsDefinition;

    @JsonProperty("report_stats_definition_score")
    private boolean statsDefinitionScore;

    @JsonProperty("report_stats_data")
    private boolean statsData;

    @JsonProperty("report_stats_results")
    private boolean statsResults;

    @JsonProperty("report_lessons_objectives")
    private boolean lessonsObjectives;

    @JsonProperty("report_lessons_stats")
    private boolean lessonsStats;

    @JsonProperty("report_lessons_details")
    private boolean lessonsDetails;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isGeneralInformation() {
        return generalInformation;
    }

    public void setGeneralInformation(boolean generalInformation) {
        this.generalInformation = generalInformation;
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

    public boolean isLessonsObjectives() {
        return lessonsObjectives;
    }

    public void setLessonsObjectives(boolean lessonsObjectives) {
        this.lessonsObjectives = lessonsObjectives;
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
}