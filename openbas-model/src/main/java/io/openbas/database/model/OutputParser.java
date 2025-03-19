package io.openbas.database.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OutputParser {

  /**
   * OutputParser
   * -> mode: stdout/sterr/fichier ->Enum
   * -> type parsing : regex /xml -> Enum
   * -> Executor/Rule/Parser: Regex/ xPath -> String
   * -> List<OutputContractElement>
   *   -> ParserOutPutContract : group, name, key, contractoutputType
   *
   * */

  String mode;
  String rule;
  List<OutputContractElement> parserOutputContractList = new ArrayList<>();
}
