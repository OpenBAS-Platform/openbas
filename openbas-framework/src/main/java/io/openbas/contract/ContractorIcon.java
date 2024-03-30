package io.openbas.contract;

import lombok.Getter;
import lombok.Setter;

import java.io.InputStream;

@Getter
@Setter
public class ContractorIcon {

    private InputStream data;

    public ContractorIcon(InputStream data) {
        this.data = data;
    }
}
