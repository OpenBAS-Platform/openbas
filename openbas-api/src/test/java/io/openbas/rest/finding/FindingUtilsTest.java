package io.openbas.rest.finding;

import static org.junit.jupiter.api.Assertions.assertEquals;

import io.openbas.database.model.ContractOutputElement;
import io.openbas.database.model.ContractOutputType;
import io.openbas.database.model.RegexGroup;
import io.openbas.database.repository.*;
import java.util.Set;
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
      "\r\nImage Name                 PID Session Name        Session#    Mem Usage\r\n"
          + "=========================  ========  ================  ===========  ============\r\n"
          + "System Idle Process           0 Services               0          8 K\r\n";

  @Mock private FindingRepository findingRepository;

  private FindingUtils findingUtils;

  @BeforeEach
  void before() {
    findingUtils = new FindingUtils(findingRepository);
  }

  @Test
  @DisplayName("Should return an empty string for an index bigger than matcher count")
  void given_a_group_bigger_than_matcher_count_should_return_empty() {
    String rawOutputByMode = SIMPLE_RAW_OUTPUT;

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("Any text");
    regexGroup1.setIndexValues("$2");

    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setType(ContractOutputType.Text);
    contractOutputElement.setRule("^(\\S+)");
    contractOutputElement.setRegexGroups(Set.of(regexGroup1));

    String regex = contractOutputElement.getRule();
    int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
    Pattern pattern = Pattern.compile(regex, flags);
    Matcher matcher = pattern.matcher(rawOutputByMode);

    StringBuilder result = new StringBuilder();
    while (matcher.find()) {
      result.append(findingUtils.buildValue(contractOutputElement, matcher)).append("\n");
    }
    assertEquals("", result.toString().trim());
  }

  @Test
  @DisplayName("Should return empty for an index no numerique")
  void given_an_index_no_numercal_should_return_nothing() {
    String rawOutputByMode = SIMPLE_RAW_OUTPUT;

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("Any text");
    regexGroup1.setIndexValues("$t");

    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setType(ContractOutputType.Text);
    contractOutputElement.setRule("^(\\S+)");
    contractOutputElement.setRegexGroups(Set.of(regexGroup1));

    String regex = contractOutputElement.getRule();
    int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
    Pattern pattern = Pattern.compile(regex, flags);

    Matcher matcher = pattern.matcher(rawOutputByMode);

    StringBuilder result = new StringBuilder();
    while (matcher.find()) {
      result.append(findingUtils.buildValue(contractOutputElement, matcher)).append("\n");
    }
    assertEquals("", result.toString().trim());
  }

  @Test
  @DisplayName("Should get image names from raw output of tasklist command")
  void given_raw_output_tasklist_should_return_names() {
    String rawOutputByMode =
        "\r\nImage Name                 PID Session Name        Session#    Mem Usage\r\n"
            + "=========================  ========  ================  ===========  ============\r\n"
            + "System Idle Process           0 Services               0          8 K\r\n"
            + "System                       4 Services               0         16 K\r\n"
            + "Secure System                284 Services               0    112,156 K\r\n"
            + "Registry                     328 Services               0     58,904 K\r\n";

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("Image name");
    regexGroup1.setIndexValues("$0");

    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setType(ContractOutputType.Text);
    contractOutputElement.setRule("^(\\S+)");
    contractOutputElement.setRegexGroups(Set.of(regexGroup1));

    String regex = contractOutputElement.getRule();
    int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
    Pattern pattern = Pattern.compile(regex, flags);

    Matcher matcher = pattern.matcher(rawOutputByMode);

    StringBuilder result = new StringBuilder();
    while (matcher.find()) {
      result.append(findingUtils.buildValue(contractOutputElement, matcher)).append("\n");
    }
    assertEquals(
        "Image\n=========================\nSystem\nSystem\nSecure\nRegistry",
        result.toString().trim());
  }

  @Test
  @DisplayName("Should get username:password from raw output command")
  void given_raw_output_tasklist_should_return_credentials() {
    String rawOutputByMode = "";

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("username");
    regexGroup1.setIndexValues("$1");

    RegexGroup regexGroup2 = new RegexGroup();
    regexGroup1.setField("password");
    regexGroup1.setIndexValues("$2");

    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setType(ContractOutputType.Text);
    contractOutputElement.setRule("^(\\S+)");
    contractOutputElement.setRegexGroups(Set.of(regexGroup1, regexGroup2));

    String regex = contractOutputElement.getRule();
    int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
    Pattern pattern = Pattern.compile(regex, flags);

    Matcher matcher = pattern.matcher(rawOutputByMode);

    StringBuilder result = new StringBuilder();
    while (matcher.find()) {
      result.append(findingUtils.buildValue(contractOutputElement, matcher)).append("\n");
    }
    assertEquals(
        "Image\n=========================\nSystem\nSystem\nSecure\nRegistry",
        result.toString().trim());
  }

  @Test
  @DisplayName("Should get host:port(service) from raw output of netstat command")
  void given_raw_output_netstat_should_return_portscans() {
    String rawOutputByMode =
        "TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       1234\\n\" +\n"
            + "                               \"UDP    0.0.0.0:53             *:*                     LISTENING       5678";

    RegexGroup regexGroup1 = new RegexGroup();
    regexGroup1.setField("host");
    regexGroup1.setIndexValues("$2");

    RegexGroup regexGroup2 = new RegexGroup();
    regexGroup2.setField("port");
    regexGroup2.setIndexValues("$3");

    RegexGroup regexGroup3 = new RegexGroup();
    regexGroup3.setField("service");
    regexGroup3.setIndexValues("$4");

    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setType(ContractOutputType.PortsScan);
    contractOutputElement.setRule(
        "^\\s*(TCP|UDP)\\s+([\\d\\.:]+):(\\d+)\\s+\\S+\\s+\\S+\\s+(\\d+)");
    contractOutputElement.setRegexGroups(Set.of(regexGroup1, regexGroup2, regexGroup3));

    String regex = contractOutputElement.getRule();
    int flags = (regex.contains("^") || regex.contains("$")) ? Pattern.MULTILINE : 0;
    Pattern pattern = Pattern.compile(regex, flags);

    Matcher matcher = pattern.matcher(rawOutputByMode);

    StringBuilder result = new StringBuilder();
    while (matcher.find()) {
      result.append(findingUtils.buildValue(contractOutputElement, matcher)).append("\n");
    }
    assertEquals("0.0.0.0:80 (1234)", result.toString().trim());
  }
}
