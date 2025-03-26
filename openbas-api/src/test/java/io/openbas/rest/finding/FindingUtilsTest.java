package io.openbas.rest.finding;

import static io.openbas.utils.fixtures.AssetFixture.getDefaultAsset;
import static io.openbas.utils.fixtures.InjectFixture.getDefaultInject;
import static io.openbas.utils.fixtures.OutputParserFixture.getDefaultContractOutputElement;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FindingUtilsTest {

  public static final String SIMPLE_RAW_OUTPUT =
      "\r\nImage Name                 PID  Session Name        Session#    Mem Usage\r\n"
          + "=========================  ========  ================  ===========  ============\r\n"
          + "System Idle Process           0  Services               0          8 K\r\n";

  @Mock private FindingRepository findingRepository;

  private FindingUtils findingUtils;

  @BeforeEach
  void setup() {
    findingUtils = new FindingUtils(findingRepository);
  }

  private Matcher getMatcher(String regex, String input) {
    int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
    return Pattern.compile(regex, flags).matcher(input);
  }

  @Test
  @DisplayName("Should return an empty string for a raw output empty")
  void given_a_raw_output_empty_should_return_empty() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$2");
    testRegexExtraction("", Set.of(regexGroup), ContractOutputType.Text, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return an empty string for an index bigger than matcher count")
  void given_a_group_bigger_than_matcher_count_should_return_empty() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$2");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT, Set.of(regexGroup), ContractOutputType.Text, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return empty for a non-numeric index")
  void given_an_index_no_numerical_should_return_empty() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$t");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT, Set.of(regexGroup), ContractOutputType.Text, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return numbers from raw output of command")
  void given_raw_output_netstat_should_return_number() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$1");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT, Set.of(regexGroup), ContractOutputType.Number, "^(\\S+)()", "");
  }

  @Test
  @DisplayName("Should get image names from raw output of tasklist command")
  void given_raw_output_tasklist_should_return_names() {
    String rawOutput =
        "\r\nImage Name                 PID Session Name        Session#    Mem Usage\r\n"
            + "=========================  ========  ================  ===========  ============\r\n"
            + "System Idle Process           0 Services               0          8 K\r\n"
            + "System                       4 Services               0         16 K\r\n"
            + "Secure System                284 Services               0    112,156 K\r\n"
            + "Registry                     328 Services               0     58,904 K\r\n";

    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Image name");
    regexGroup.setIndexValues("$0");

    testRegexExtraction(
        rawOutput,
        Set.of(regexGroup),
        ContractOutputType.Text,
        "^(\\S+)",
        "Image\n=========================\nSystem\nSystem\nSecure\nRegistry");
  }

  @Test
  @DisplayName("Should get username:password from raw output command")
  void given_raw_output_tasklist_should_return_credentials() {
    String rawOutput = "user1 pass123\nadmin root\n";

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("username");
    regexGroup1.setIndexValues("$1");

    RegexGroup regexGroup2 = new RegexGroup();
    regexGroup1.setField("password");
    regexGroup1.setIndexValues("$2");

    Set<RegexGroup> regexGroups = Set.of(regexGroup1, regexGroup2);

    this.testRegexExtraction(
        rawOutput,
        regexGroups,
        ContractOutputType.Credentials,
        "^(\\S+)\\s+(\\S+)",
        "user1:pass123\nadmin:root");
  }

  @Test
  @DisplayName("Should get host:port(service) from raw output of netstat command")
  void given_raw_output_netstat_should_return_portscans() {
    String rawOutput =
        """
            TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       1234
            UDP    0.0.0.0:53             *:*                    LISTENING       5678
        """;
    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("host");
    regexGroup1.setIndexValues("$2");

    RegexGroup regexGroup2 = new RegexGroup();
    regexGroup2.setField("port");
    regexGroup2.setIndexValues("$3");

    RegexGroup regexGroup3 = new RegexGroup();
    regexGroup3.setField("service");
    regexGroup3.setIndexValues("$4");

    Set<RegexGroup> regexGroups = Set.of(regexGroup1, regexGroup2, regexGroup3);

    testRegexExtraction(
        rawOutput,
        regexGroups,
        ContractOutputType.PortsScan,
        "^\\s*(TCP|UDP)\\s+([\\d\\.:]+):(\\d+)\\s+\\S+\\s+\\S+\\s+(\\d+)",
        "0.0.0.0:80 (1234)\n0.0.0.0:53 (5678)");
  }

  @Test
  @DisplayName("Should return ports from raw output of command")
  void given_raw_output_netstat_should_return_ports() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$t");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT, Set.of(regexGroup), ContractOutputType.Port, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return ipv4s from raw output of command")
  void given_raw_output_netstat_should_return_ipv4() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$t");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT, Set.of(regexGroup), ContractOutputType.IPv4, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return ipv6s  from raw output of command")
  void given_raw_output_netstat_should_return_ipv6() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$t");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT, Set.of(regexGroup), ContractOutputType.IPv6, "^(\\S+)", "");
  }

  private void testRegexExtraction(
      String input,
      Set<RegexGroup> regexGroups,
      ContractOutputType type,
      String regex,
      String expected) {
    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setType(type);
    contractOutputElement.setRule(regex);
    contractOutputElement.setRegexGroups(regexGroups);

    Matcher matcher = getMatcher(regex, input);
    StringBuilder result = new StringBuilder();

    while (matcher.find()) {
      result.append(findingUtils.buildValue(contractOutputElement, matcher)).append("\n");
    }

    assertEquals(expected, result.toString().trim());
  }

  @Test
  @DisplayName("Should have two assets for a finding")
  void given_a_finding_already_existent_with_one_asset_should_have_two_assets() {
    Inject inject = getDefaultInject();
    Asset asset1 = getDefaultAsset("asset1");
    Asset asset2 = getDefaultAsset("asset2");
    String value = "value-already-existent";
    ContractOutputElement contractOutputElement = getDefaultContractOutputElement();

    Finding finding1 = new Finding();
    finding1.setValue(value);
    finding1.getAssets().add(asset1);

    when(findingRepository.findByInjectIdAndValue(inject.getId(), value))
        .thenReturn(Optional.of(finding1));

    Finding updatedFinding =
        findingUtils.buildFinding(inject, asset2, contractOutputElement, value);
    assertEquals(2, updatedFinding.getAssets().size());
  }
}
