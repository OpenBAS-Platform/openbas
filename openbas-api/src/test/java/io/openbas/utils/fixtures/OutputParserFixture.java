package io.openbas.utils.fixtures;

import io.openbas.database.model.*;
import java.util.Set;

public class OutputParserFixture {

  public static OutputParser getDefaultOutputParser() {
    ContractOutputElement contractOutputElement = getDefaultContractOutputElement();

    OutputParser outputParser = new OutputParser();
    outputParser.setType(ParserType.REGEX);
    outputParser.setMode(ParserMode.STDOUT);
    outputParser.setContractOutputElements(Set.of(contractOutputElement));

    return outputParser;
  }

  public static RegexGroup getDefaultRegexGroup() {
    RegexGroup regexGroup = new RegexGroup();
    regexGroup.setField("Any text");
    regexGroup.setIndexValues("$t");
    return regexGroup;
  }

  public static ContractOutputElement getDefaultContractOutputElement() {
    ContractOutputElement contractOutputElement = new ContractOutputElement();
    contractOutputElement.setType(ContractOutputType.IPv6);
    contractOutputElement.setRule(("/d+"));
    contractOutputElement.setRegexGroups(Set.of(getDefaultRegexGroup()));
    return contractOutputElement;
  }
}
