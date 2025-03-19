package io.openbas.injectorContract;

import java.io.InputStream;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractorIcon {

  private InputStream data;

  public ContractorIcon(InputStream data) {
    this.data = data;
  }
}
