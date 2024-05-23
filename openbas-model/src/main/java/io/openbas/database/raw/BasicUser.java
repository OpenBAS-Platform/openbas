package io.openbas.database.raw;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BasicUser {

  private String user_id;
  private String user_firstname;
  private String user_lastname;
  private String user_email;
  private String user_phone;
  private Instant user_created_at;
  private BasicOrganization user_organization;
  private List<String> user_groups;
  private List<String> user_teams;
  private List<String> user_tags;

}
