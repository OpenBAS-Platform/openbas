package io.openbas.database.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
@Embeddable
public class ScenarioTeamUserId implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String scenarioId;
    private String teamId;
    private String userId;

    public ScenarioTeamUserId() {
        // Default constructor
    }

}
