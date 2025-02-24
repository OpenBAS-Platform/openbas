package io.openbas.rest.finding;

import io.openbas.database.model.ContractOutputType;
import io.openbas.database.model.Finding;

public class FindingFixture {

  public static final String TEXT_FIELD = "text_field";
  public static final String IPV6_FIELD = "ipv6_field";
  public static final String CREDENTIALS_FIELD = "credentials_field";

  public static Finding createDefaultTextFinding() {
    Finding finding = new Finding();
    finding.setType(ContractOutputType.Text);
    finding.setField(TEXT_FIELD);
    finding.setValue("text_value");
    finding.setLabels(new String[]{"reconnaissance phase"});
    return finding;
  }

  public static Finding createDefaultIPV6Finding() {
    Finding finding = new Finding();
    finding.setType(ContractOutputType.IPv6);
    finding.setField(IPV6_FIELD);
    finding.setValue("2001:0000:130F:0000:0000:09C0:876A:130B");
    return finding;
  }

  public static Finding createDefaultFindingCredentials() {
    Finding finding = new Finding();
    finding.setType(ContractOutputType.Credentials);
    finding.setField(CREDENTIALS_FIELD);
    finding.setValue("admin:admin");
    return finding;
  }

}
