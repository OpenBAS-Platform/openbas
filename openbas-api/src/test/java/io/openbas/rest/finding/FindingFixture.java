package io.openbas.rest.finding;

import io.openbas.database.model.finding.Finding;

import static io.openbas.database.model.finding.FindingUtils.*;

public class FindingFixture {

  public static final String STRING_FIELD = "string_field";
  public static final String IPV6_FIELD = "ipv6_field";
  public static final String CREDENTIALS_FIELD = "credentials_field";

  public static Finding createDefaultStringFinding() {
    Finding finding = createFindingString(STRING_FIELD, "string_value");
    finding.setLabels(new String[]{
        "reconnaissance phase"
    });
    return finding;
  }

  public static Finding createDefaultIPV6Finding() {
    return createFindingIPV6(IPV6_FIELD, "2001:0000:130F:0000:0000:09C0:876A:130B");
  }

  public static Finding createDefaultFindingCredentials() {
    return createFindingCredentials(CREDENTIALS_FIELD, "admin", "admin");
  }

}
