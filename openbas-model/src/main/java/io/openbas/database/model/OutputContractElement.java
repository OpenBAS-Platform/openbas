package io.openbas.database.model;

import lombok.Data;

@Data
public class OutputContractElement {

  /**
   *   -> ParserOutPutContract : group, name, key, contractoutputType
   *
   * */
  int group;
  String name;
  String key;
  ContractOutputType type;
}
