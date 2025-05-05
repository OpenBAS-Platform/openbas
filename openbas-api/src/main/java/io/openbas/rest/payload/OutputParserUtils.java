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
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Log
@RequiredArgsConstructor
@Component
public class OutputParserUtils {

  private final ContractOutputElementUtils contractOutputElementUtils;

  public <T> void copyOutputParsers(Set<T> inputParsers, Payload target, boolean copyId) {
    if (inputParsers == null) {
      return;
    }
    Instant now = now();
    Set<OutputParser> outputParsers =
        inputParsers.stream()
            .map(inputParser -> copyOutputParser(inputParser, target, copyId, now))
            .collect(Collectors.toSet());

    target.setOutputParsers(new HashSet<>(outputParsers));
  }

  private <T> OutputParser copyOutputParser(
      T inputParser, Payload target, boolean copyId, Instant now) {
    OutputParser outputParser = new OutputParser();
    outputParser.setPayload(target);
    outputParser.setCreatedAt(now);
    outputParser.setUpdatedAt(now);
    if (inputParser instanceof OutputParserInput) {
      copyFromParserInput((OutputParserInput) inputParser, outputParser, copyId);
    } else if (inputParser instanceof OutputParser) {
      copyFromParserEntity((OutputParser) inputParser, outputParser, copyId);
    }
    return outputParser;
  }

  private void copyFromParserInput(
      OutputParserInput parserInput, OutputParser outputParser, boolean copyId) {
    BeanUtils.copyProperties(parserInput, outputParser, "id", "contractOutputElements");
    if (copyId) {
      outputParser.setId(parserInput.getId());
    }
    contractOutputElementUtils.copyContractOutputElements(
        parserInput.getContractOutputElements(), outputParser, copyId);
  }

  private void copyFromParserEntity(
      OutputParser parser, OutputParser outputParser, boolean copyId) {
    BeanUtils.copyProperties(parser, outputParser, "id", "contractOutputElements");
    if (copyId) {
      outputParser.setId(parser.getId());
    }
    contractOutputElementUtils.copyContractOutputElements(
        parser.getContractOutputElements(), outputParser, copyId);
  }
}
