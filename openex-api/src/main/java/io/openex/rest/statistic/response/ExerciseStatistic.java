package io.openex.rest.statistic.response;

public class ExerciseStatistic {

    private Long numberOfIncidents;

    public ExerciseStatistic(Long numberOfIncidents) {
        this.numberOfIncidents = numberOfIncidents;
    }

    public Long getNumberOfIncidents() {
        return numberOfIncidents;
    }

    public void setNumberOfIncidents(Long numberOfIncidents) {
        this.numberOfIncidents = numberOfIncidents;
    }
}

/*
        return [
            'allInjectsCount' => $this->getAllInjectsCount($exerciseId),
            'avgInjectPerPlayerCount' => $this->getAverageInjectsNumberPerPlayer($exerciseId),
            'allPlayersCount' => $this->getAllPlayersCount($exerciseId),
            'organizationsCount' => $this->getOrganizationsCount($exerciseId),
            'frequencyOfInjectsCount' => $this->getInjectsFrequency($exerciseId),
            'injectPerPlayer' => $this->getInjectsCountsPerPlayer($exerciseId),
            'injectPerIncident' => $this->getInjectsCountsPerIncident($exerciseId),
            'injectPerInterval' => $this->getInjectsCountsPerInterval($exerciseId, $interval),
            'value' => strval($this->getDefaultInteval($exerciseId, $interval))
        ];
 */