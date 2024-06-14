package io.openbas.database.raw;

import io.openbas.database.model.Organization;
import io.openbas.database.model.Tag;
import io.openbas.database.model.Team;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Data
public class RawPaginationTeam {

  String team_id;
  String team_name;
  String team_description;
  long team_users_number;
  String team_organization;
  List<String> team_tags;
  boolean team_contextual;
  Instant team_updated_at;

  public RawPaginationTeam(final Team team) {
    this.team_id = team.getId();
    this.team_name = team.getName();
    this.team_description = team.getDescription();
    this.team_users_number = team.getUsersNumber();
    this.team_organization = Optional.ofNullable(team.getOrganization()).map(Organization::getId).orElse(null);
    this.team_tags = team.getTags().stream().map(Tag::getId).toList();
    this.team_contextual = team.getContextual();
    this.team_updated_at = team.getUpdatedAt();
  }
}
