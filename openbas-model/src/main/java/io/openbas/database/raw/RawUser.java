package io.openbas.database.raw;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RawUser {

  private String user_id;
  private String user_firstname;
  private String user_lastname;
  private String user_email;
  private String user_phone;
  private String user_gravatar;
  private Instant user_created_at;
  private String user_organization;
  private List<String> user_groups;
  private List<String> user_teams;
  private List<String> user_tags;

}
