package io.openbas.utils.fixtures;

import static java.lang.String.valueOf;

import io.openbas.database.model.KillChainPhase;
import jakarta.validation.constraints.NotBlank;
import java.util.Random;

public class KillChainPhaseFixture {

  private static final Random RANDOM = new Random();

  public static KillChainPhase getKillChainPhase(@NotBlank final String name) {
    KillChainPhase killChainPhase = new KillChainPhase();
    killChainPhase.setName(name);
    killChainPhase.setShortName(name);
    killChainPhase.setKillChainName("mitre-attack");
    killChainPhase.setExternalId(valueOf(RANDOM.nextInt()));
    return killChainPhase;
  }
}
