package io.openbas.rest.payload;

import static java.time.Instant.now;

import io.openbas.database.model.*;
import io.openbas.rest.payload.form.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class OutputParserUtils {

  private final ContractOutputElementUtils contractOutputElementUtils;

  public <T> void copyOutputParsers(Set<T> inputParsers, Payload target, boolean copyId) {
    if (inputParsers != null) {
      Set<OutputParser> outputParsers =
          inputParsers.stream()
              .map(
                  inputParser -> {
                    OutputParser outputParser = new OutputParser();
                    outputParser.setPayload(target);

                    Instant now = now();
                    outputParser.setCreatedAt(now);
                    outputParser.setUpdatedAt(now);

                    // Handle contract output elements based on the input type
                    if (inputParser instanceof OutputParserInput) {
                      OutputParserInput parserInput = (OutputParserInput) inputParser;
                      if (!copyId) {
                        outputParser.setId(null);
                      } else {
                        outputParser.setId(parserInput.getId());
                      }
                      outputParser.setType(parserInput.getType());
                      outputParser.setMode(parserInput.getMode());
                      contractOutputElementUtils.copyContractOutputElements(
                          parserInput.getContractOutputElements(), outputParser, copyId);
                    } else if (inputParser instanceof OutputParser) {
                      OutputParser parser = (OutputParser) inputParser;
                      if (!copyId) {
                        outputParser.setId(null);
                      } else {
                        outputParser.setId(parser.getId());
                      }
                      outputParser.setType(parser.getType());
                      outputParser.setMode(parser.getMode());
                      contractOutputElementUtils.copyContractOutputElements(
                          parser.getContractOutputElements(), outputParser, copyId);
                    }

                    return outputParser;
                  })
              .collect(Collectors.toSet());

      target.setOutputParsers(new HashSet<>(outputParsers));
    }
  }
}
