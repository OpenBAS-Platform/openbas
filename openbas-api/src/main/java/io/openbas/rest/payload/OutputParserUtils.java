package io.openbas.rest.payload;

import static java.time.Instant.now;

import io.openbas.database.model.*;
import io.openbas.database.repository.OutputParserRepository;
import io.openbas.rest.payload.form.*;
import java.time.Instant;
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

  private final OutputParserRepository outputParserRepository;
  private final ContractOutputElementUtils contractOutputElementUtils;

  public <T> void copyOutputParsers(Set<T> inputParsers, Payload target, boolean copyId) {
    if (inputParsers != null) {
      Set<OutputParser> outputParsers =
          inputParsers.stream()
              .map(
                  inputParser -> {
                    OutputParser outputParser = new OutputParser();
                    BeanUtils.copyProperties(inputParser, outputParser);
                    if (!copyId) {
                      outputParser.setId(null);
                    }
                    outputParser.setPayload(target);

                    Instant now = now();
                    outputParser.setCreatedAt(now);
                    outputParser.setUpdatedAt(now);

                    // Handle contract output elements based on the input type
                    if (inputParser instanceof OutputParserInput) {
                      OutputParserInput parserInput = (OutputParserInput) inputParser;
                      contractOutputElementUtils.copyContractOutputElements(
                          parserInput.getContractOutputElements(), outputParser, copyId);
                    } else if (inputParser instanceof OutputParser) {
                      OutputParser parser = (OutputParser) inputParser;
                      contractOutputElementUtils.copyContractOutputElements(
                          parser.getContractOutputElements(), outputParser, copyId);
                    }

                    return outputParser;
                  })
              .collect(Collectors.toSet());

      target.setOutputParsers(outputParsers);
    }
  }

  public void removeOrphanOutputParsers(
      Set<OutputParserInput> outputParserInputs, String payloadId) {

    Set<OutputParserInput> toBeUpdated =
        outputParserInputs.stream().filter(op -> op.getId() != null).collect(Collectors.toSet());

    if (toBeUpdated.isEmpty()) {
      outputParserRepository.deleteByPayloadId(payloadId);
    }
    outputParserRepository.deleteByPayloadIdAndIdNotIn(
        payloadId, toBeUpdated.stream().map(OutputParserInput::getId).collect(Collectors.toList()));

    contractOutputElementUtils.removeOrphanContractOutputElements(toBeUpdated);
  }
}
