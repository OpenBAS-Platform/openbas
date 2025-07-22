package io.openbas.database.raw;

import java.time.Instant;
import java.util.Set;

public interface RawInjectIndexing {

  String getInject_id();

  String getInject_title();

  Instant getInject_created_at();

  Instant getInject_updated_at();

  String getInject_injector_contract();

  Instant getInjector_contract_updated_at();

  Set<String> getInject_attack_patterns();

  Set<String> getInject_children();

  Set<String> getAttack_patterns_children();

  Set<String> getInject_kill_chain_phases();

  String getInject_status_name();

  String getInject_scenario();

  String getInject_Exercise();
}
