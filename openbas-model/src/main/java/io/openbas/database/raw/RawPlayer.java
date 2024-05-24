package io.openbas.database.raw;

import io.openbas.database.model.Organization;
import io.openbas.database.model.Tag;
import io.openbas.database.model.User;
import lombok.Data;

import java.util.List;

import static java.util.Optional.ofNullable;

@Data
public class RawPlayer {

  String user_id;
  String user_email;
  String user_firstname;
  String user_lastname;
  String user_organization;
  List<String> user_tags;

  public RawPlayer(final User user) {
    this.user_id = user.getId();
    this.user_email = user.getEmail();
    this.user_firstname = user.getFirstname();
    this.user_lastname = user.getLastname();
    this.user_organization = ofNullable(user.getOrganization()).map(Organization::getId).orElse(null);
    this.user_tags = user.getTags().stream().map(Tag::getId).toList();
  }
}
