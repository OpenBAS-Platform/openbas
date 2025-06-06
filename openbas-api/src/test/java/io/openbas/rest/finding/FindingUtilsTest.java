package io.openbas.rest.finding;

import static io.openbas.utils.fixtures.AssetFixture.createDefaultAsset;
import static io.openbas.utils.fixtures.InjectFixture.getDefaultInject;
import static io.openbas.utils.fixtures.OutputParserFixture.getDefaultContractOutputElement;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FindingUtilsTest {

  public static final String SIMPLE_RAW_OUTPUT_TASKLIST =
      "\r\nImage Name                 PID  Session Name        Session#    Mem Usage\r\n"
          + "=========================  ========  ================  ===========  ============\r\n"
          + "System Idle Process           0  Services               0          8 K\r\n";

  public static final String SIMPLE_RAW_OUTPUT_NETSTAT =
      "\n"
          + "Active Connections\n"
          + "\n"
          + "  Proto  Local Address          Foreign Address        State\n"
          + "  TCP    192.168.1.10:135            0.0.0.0:0              LISTENING\n"
          + "  TCP    176.125.125.10:445            0.0.0.0:0              LISTENING\n"
          + "  TCP    192.168.12.12:902            0.0.0.0:0              LISTENING\n";
  public static final String ASSET_1 = "asset1";
  public static final String ASSET_2 = "asset2";

  @Mock private FindingRepository findingRepository;
  private final ObjectMapper mapper = new ObjectMapper();

  private FindingUtils findingUtils;

  @BeforeEach
  void setup() {
    findingUtils = new FindingUtils(mapper, findingRepository);
  }

  private Matcher getMatcher(String regex, String input) {
    int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
    return Pattern.compile(regex, flags).matcher(input);
  }

  @Test
  @DisplayName("Should return an empty string for a raw output empty")
  void given_a_raw_output_empty_should_return_empty() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Empty output");
    regexGroup.setIndexValues("$2");
    testRegexExtraction("", Set.of(regexGroup), ContractOutputType.Text, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return an empty string for an index bigger than matcher count")
  void given_a_group_bigger_than_matcher_count_should_return_empty() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Wrong Index");
    regexGroup.setIndexValues("$2");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT_TASKLIST, Set.of(regexGroup), ContractOutputType.Text, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return empty for a non-numeric index")
  void given_an_index_no_numerical_should_return_empty() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Non-numeric Index");
    regexGroup.setIndexValues("$t");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT_TASKLIST, Set.of(regexGroup), ContractOutputType.Text, "^(\\S+)", "");
  }

  @Test
  @DisplayName("Should return numbers from raw output of command")
  void given_raw_output_netstat_should_return_number() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any number");
    regexGroup.setIndexValues("$1");
    testRegexExtraction(
        SIMPLE_RAW_OUTPUT_NETSTAT,
        Set.of(regexGroup),
        ContractOutputType.Number,
        "(\\d+)",
        "192\n168\n1\n10\n135\n0\n"
            + "0\n0\n0\n0\n176\n125\n125\n"
            + "10\n445\n0\n0\n0\n0\n0\n192\n"
            + "168\n12\n12\n902\n0\n0\n0\n0\n0");
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
    // username:RID:LM_Hash:NTLM_Hash:::
    String rawOutput =
        "{\n"
            + "  \"severity\": \"critical\",\n"
            + "  \"host\": \"192.168.56.23\",\n"
            + "  \"classification\": {\n"
            + "    \"cve-id\": [\n"
            + "      \"cve-2023-35078\"\n"
            + "    ]\n"
            + "  }\n"
            + "}";

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("severity");
    regexGroup1.setIndexValues("$1");

    RegexGroup regexGroup2 = new RegexGroup();
    regexGroup2.setField("host");
    regexGroup2.setIndexValues("$2");

    RegexGroup regexGroup3 = new RegexGroup();
    regexGroup3.setField("id");
    regexGroup3.setIndexValues("$3");

    Set<RegexGroup> regexGroups = Set.of(regexGroup1, regexGroup2, regexGroup3);

    String regex =
        "\"severity\"\\s*:\\s*\"([^\"]+)\"[\\s\\S]*?"
            + "\"host\"\\s*:\\s*\"([^\"]+)\"[\\s\\S]*?"
            + "\"cve-id\"\\s*:\\s*\\[\\s*((?:\"[^\"]+\"\\s*,?\\s*)+)";

    this.testRegexExtraction(
        rawOutput,
        regexGroups,
        ContractOutputType.CVE,
        regex,
        "192.168.56.23:cve-2023-35078 (critical)");
  }

  @Test
  @DisplayName("Should get host:port (service) from raw output of netstat command")
  void given_raw_output_netstat_should_return_portscans() {
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
        SIMPLE_RAW_OUTPUT_NETSTAT,
        regexGroups,
        ContractOutputType.PortsScan,
        "^\\s*(TCP|UDP)\\s+([\\d\\.]+|\\*)?:?(\\d+)\\s+\\S+\\s+(\\S+)",
        "192.168.1.10:135 (LISTENING)\n176.125.125.10:445 (LISTENING)\n192.168.12.12:902 (LISTENING)");
  }

  @Test
  @DisplayName("Should return ports from raw output of netstat -an command")
  void given_raw_output_netstat_should_return_ports() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("port");
    regexGroup.setIndexValues("$1");

    testRegexExtraction(
        SIMPLE_RAW_OUTPUT_NETSTAT,
        Set.of(regexGroup),
        ContractOutputType.Port,
        "(?:TCP|UDP)\\s+[\\d\\.]+:(\\d+)",
        "135\n445\n902");
  }

  @Test
  @DisplayName("Should return IPv4s from raw output of netstat -an command")
  void given_raw_output_netstat_should_return_ipv4() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("ipv4");
    regexGroup.setIndexValues("$0");

    testRegexExtraction(
        SIMPLE_RAW_OUTPUT_NETSTAT,
        Set.of(regexGroup),
        ContractOutputType.IPv4,
        "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
        "192.168.1.10\n0.0.0.0\n176.125.125.10\n0.0.0.0\n192.168.12.12\n0.0.0.0");
  }

  @Test
  @DisplayName("Should return IPv6s from raw output of netstat -an command")
  void given_raw_output_netstat_should_return_ipv6() {
    String rawOutput =
        "\n"
            + "Active Connections\n"
            + "\n"
            + " Proto Local Address Foreign Address State\n"
            + " TCP 0.0.0.0:135 0.0.0.0:0 LISTENING\n"
            + " UDP [fe80::1b03:a1ff:ccdb:b464%66]:1900 *:*\n"
            + " UDP [fe80::1b04:a1ff:ccdb:b464%66]:2177 *:*\n"
            + " UDP [fe80::1b03:a1ff:ccdb:b464%66]:58907 *:*\n"
            + " UDP [fe80::6168:894c:9ee9:d02a%27]:1900 *:*\n";

    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("ipv6");
    regexGroup.setIndexValues("$1");

    String ipv6Regex = "\\[([a-fA-F0-9:]+(?:%[a-zA-Z0-9]+)?)\\]:\\d+";

    testRegexExtraction(
        rawOutput,
        Set.of(regexGroup),
        ContractOutputType.IPv6,
        ipv6Regex,
        "fe80::1b03:a1ff:ccdb:b464%66\nfe80::1b04:a1ff:ccdb:b464%66\nfe80::1b03:a1ff:ccdb:b464%66\nfe80::6168:894c:9ee9:d02a%27");
  }

  @Test
  @DisplayName("Should get host:cve (severity) from raw output command")
  void given_raw_output_cve_should_return_cve() {
    String rawOutput =
        "SMB                      192.168.11.23   415    CASSANOVAS          [+] workgroup\\\\savacano:savacano (Pwn3d!)\\n";

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("username");
    regexGroup1.setIndexValues("$2");

    RegexGroup regexGroup2 = new RegexGroup();
    regexGroup2.setField("password");
    regexGroup2.setIndexValues("$3");

    Set<RegexGroup> regexGroups = Set.of(regexGroup1, regexGroup2);

    this.testRegexExtraction(
        rawOutput,
        regexGroups,
        ContractOutputType.Credentials,
        "(\\S+)\\\\(\\S+):(\\S+)",
        "savacano:savacano");
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
    Asset asset1 = createDefaultAsset(ASSET_1);
    asset1.setId(ASSET_1);
    Asset asset2 = createDefaultAsset(ASSET_2);
    asset2.setId(ASSET_2);
    String value = "value-already-existent";
    ContractOutputElement contractOutputElement = getDefaultContractOutputElement();

    Finding finding1 = new Finding();
    finding1.setValue(value);
    finding1.setInject(inject);
    finding1.setField(contractOutputElement.getKey());
    finding1.setType(contractOutputElement.getType());
    finding1.setAssets(new ArrayList<>(Arrays.asList(asset1)));

    when(findingRepository.findByInjectIdAndValueAndTypeAndKey(
            inject.getId(), value, contractOutputElement.getType(), contractOutputElement.getKey()))
        .thenReturn(Optional.of(finding1));

    findingUtils.buildFinding(inject, asset2, contractOutputElement, value);

    ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
    verify(findingRepository).save(findingCaptor.capture());
    Finding capturedFinding = findingCaptor.getValue();

    assertEquals(2, capturedFinding.getAssets().size());
    Set<String> assetIds =
        capturedFinding.getAssets().stream().map(Asset::getId).collect(Collectors.toSet());
    assertTrue(assetIds.contains(ASSET_1));
    assertTrue(assetIds.contains(ASSET_2));
  }

  @Test
  @DisplayName("Should have one asset for a finding")
  void given_a_finding_already_existent_with_same_asset_should_have_one_assets() {
    Inject inject = getDefaultInject();
    Asset asset1 = createDefaultAsset(ASSET_1);
    asset1.setId(ASSET_1);
    String value = "value-already-existent";
    ContractOutputElement contractOutputElement = getDefaultContractOutputElement();

    Finding finding1 = new Finding();
    finding1.setValue(value);
    finding1.setInject(inject);
    finding1.setField(contractOutputElement.getKey());
    finding1.setType(contractOutputElement.getType());
    finding1.setAssets(new ArrayList<>(Arrays.asList(asset1)));

    when(findingRepository.findByInjectIdAndValueAndTypeAndKey(
            inject.getId(), value, contractOutputElement.getType(), contractOutputElement.getKey()))
        .thenReturn(Optional.of(finding1));

    findingUtils.buildFinding(inject, asset1, contractOutputElement, value);

    verify(findingRepository, never()).save(any());
  }
}
