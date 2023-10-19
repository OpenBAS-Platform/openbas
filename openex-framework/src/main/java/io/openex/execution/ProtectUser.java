package io.openex.execution;

import lombok.Data;

@Data
public class ProtectUser {

  private String id;
  private String email;
  private String firstname;
  private String lastname;
  private String lang;
  private String pgpKey;
  private String phone;
}
