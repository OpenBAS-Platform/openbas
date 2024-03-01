package io.openbas.rest.contract;

import io.openbas.contract.ContractConfig;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.util.*;

@RequiredArgsConstructor
@RestController
@Slf4j
public class ContractApi extends RestBehavior {

  public static final String CONTRACT_URI = "/api/contracts";

  private final ContractService contractService;

  @GetMapping(value = CONTRACT_URI + "/images")
  public @ResponseBody Map<String, String> contractIcon() {
    List<ContractConfig> contractTypes = this.contractService.getContractConfigs();
    Map<String, String> map = new HashMap<>();
    contractTypes.forEach((contract -> {
      try {
        String fileName = contract.getIcon();
        InputStream in = getClass().getResourceAsStream(fileName);
        assert in != null;
        byte[] fileContent;
        fileContent = IOUtils.toByteArray(in);
        String encodedString = Base64.getEncoder().encodeToString(fileContent);
        map.put(contract.getType(), encodedString);
      } catch (Exception e) {
        log.debug("Logo not found for contract : " + contract.getType());
      }
    }));
    return map;
  }

}
