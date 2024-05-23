package io.openbas.database.raw;

import java.util.List;

public interface RawUser {

  String getUser_id();
  String getUser_firstname();
  String getUser_lastname();
  String getUser_email();
  String getUser_organization();
  List<String> getUsers_groups();
  List<String> getUsers_teams();
  List<String> getUsers_tags();
  List<String> getTokens();

}
