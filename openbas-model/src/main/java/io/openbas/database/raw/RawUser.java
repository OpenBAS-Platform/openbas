package io.openbas.database.raw;

import java.time.Instant;
import java.util.List;

public interface RawUser {

  String getUser_id();
  String getUser_firstname();
  String getUser_lastname();
  String getUser_email();
  RawOrganization getUser_organization();
  Instant getUser_created_at();
  List<String> getUser_groups();
  List<String> getUser_teams();
  List<String> getUser_tags();

}
