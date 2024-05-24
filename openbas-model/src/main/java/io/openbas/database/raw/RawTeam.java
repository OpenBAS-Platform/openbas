package io.openbas.database.raw;

import io.openbas.database.model.Tag;
import io.openbas.database.model.Team;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class RawTeam {

  String team_id;
  String team_name;
  String team_description;
  long team_users_number;
  List<String> team_tags;
  boolean team_contextual;
  Instant team_updated_at;

  public RawTeam(final Team team) {
    this.team_id = team.getId();
    this.team_name = team.getName();
    this.team_description = team.getDescription();
    this.team_users_number = team.getUsersNumber();
    this.team_tags = team.getTags().stream().map(Tag::getId).toList();
    this.team_contextual = team.getContextual();
    this.team_updated_at = team.getUpdatedAt();
  }
}
