package io.openbas.rest.exercise.exports;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import jakarta.annotation.Resource;

public class Exporter {
    private static final int VERSION = 1;
    @Resource private ObjectMapper objectMapper;
    public ExerciseFileExport export(Exercise exercise, boolean withPlayers, boolean withTeams, boolean withVariableValues) {
        int exportOptions = ExportOptions.mask(withPlayers, withTeams, withVariableValues);
        return ExerciseFileExport.fromExercise(exercise).withOptions(exportOptions);
    }
}
