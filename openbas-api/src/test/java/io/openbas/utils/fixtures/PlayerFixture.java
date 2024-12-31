package io.openbas.utils.fixtures;

import io.openbas.rest.user.form.player.PlayerInput;

public class PlayerFixture {

  public static PlayerInput createPlayer() {
    PlayerInput player = new PlayerInput();
    player.setEmail("player@example.com");
    player.setFirstname("Firstname");
    player.setLastname("Lastname");
    player.setCountry("France");
    player.setPhone("+33123456789");
    player.setPgpKey("a123b");
    return player;
  }
}
