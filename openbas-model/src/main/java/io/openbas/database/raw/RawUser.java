package io.openbas.database.raw;

import io.openbas.helper.UserHelper;
import java.time.Instant;
import java.util.List;

public interface RawUser {

  default String getUser_gravatar() {
    return UserHelper.getGravatar(getUser_email());
  }
  default String getName() { return getUser_firstname() + " " + getUser_lastname(); }

  String getUser_id();
  String getUser_firstname();
  String getUser_lastname();
  String getUser_email();
  String getUser_phone();
  Instant getUser_created_at();
  String getUser_organization();
  List<String> getUser_groups();
  List<String> getUser_teams();
  List<String> getUser_tags();

}
