package io.openbas.database.raw;

import io.openbas.helper.UserHelper;
import java.util.List;

public interface RawPlayer {

  default String getUser_gravatar() {
    return UserHelper.getGravatar(getUser_email());
  }

  String getUser_id();

  String getUser_firstname();

  String getUser_lastname();

  String getUser_email();

  String getUser_organization();

  List<String> getUser_tags();
}
