package io.openbas.utils.fixtures.payload_fixture;

import io.openbas.database.model.*;
import io.openbas.rest.payload.output_parser.OutputParserInput;

public class OutputParserInputFixture {

  public static OutputParserInput createDefaultOutputParseInput() {
    OutputParserInput outputParserInput = new OutputParserInput();
    outputParserInput.setMode(ParserMode.STDOUT);
    outputParserInput.setType(ParserType.REGEX);
    return outputParserInput;
  }
}
