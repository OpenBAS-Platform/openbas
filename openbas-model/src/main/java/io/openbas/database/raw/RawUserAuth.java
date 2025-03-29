package io.openbas.database.raw;

import java.util.Set;

public interface RawUserAuth {

  String getUser_id();

  boolean getUser_admin();

  Set<String> getUser_grant_exercises();

  Set<String> getUser_grant_scenarios();
}
