package io.openbas.injectors.openbas;

import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;

import io.openbas.helper.SupportedLanguage;
import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.ContractConfig;
import io.openbas.injector_contract.Contractor;
import io.openbas.injector_contract.ContractorIcon;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OpenBASImplantContract extends Contractor {

  public static final String TYPE = "openbas_implant";

  @Override
  public boolean isExpose() {
    return true;
  }

  @Override
  public String getType() {
    return TYPE;
  }

  public ContractorIcon getIcon() {
    InputStream iconStream = getClass().getResourceAsStream("/img/icon-openbas.png");
    return new ContractorIcon(iconStream);
  }

  @Override
  public ContractConfig getConfig() {
    Map<SupportedLanguage, String> labels = Map.of(en, "OpenBAS Implant", fr, "OpenBAS Implant");
    return new ContractConfig(
        TYPE, labels, "#8b0000", "#8b0000", "/img/icon-openbas.png", isExpose());
  }

  @Override
  public List<Contract> contracts() throws Exception {
    return List.of();
  }
}
