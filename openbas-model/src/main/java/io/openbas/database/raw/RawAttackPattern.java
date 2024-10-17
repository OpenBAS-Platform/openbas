package io.openbas.database.raw;

import java.util.List;

@SuppressWarnings("unused")
public interface RawAttackPattern {
  String getAttack_pattern_id();

  String getAttack_pattern_stix_id();

  String getAttack_pattern_name();

  String getAttack_pattern_description();

  String getAttack_pattern_external_id();

  List<String> getAttack_pattern_platforms();

  List<String> getAttack_pattern_permissions_required();

  String getAttack_pattern_created_at();

  String getAttack_pattern_updated_at();

  String getAttack_pattern_parent();

  List<String> getAttack_pattern_kill_chain_phases();
}
