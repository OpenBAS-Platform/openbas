package io.openbas.rest.exercise.exports;

public enum ExportOptions {
    WITH_PLAYERS(1), WITH_TEAMS(2), WITH_VARIABLE_VALUES(4);

    private final int rank;

    ExportOptions(int rank) {
        this.rank = rank;
    }

    public static int mask(boolean with_players, boolean with_teams, boolean with_variable_values) {
        return (with_players ? WITH_PLAYERS.rank : 0)
             | (with_teams ? WITH_TEAMS.rank : 0)
             | (with_variable_values ? WITH_VARIABLE_VALUES.rank : 0);
    }

    public static boolean has(ExportOptions option, int mask) {
        return (mask & option.rank) != 0;
    }
}
