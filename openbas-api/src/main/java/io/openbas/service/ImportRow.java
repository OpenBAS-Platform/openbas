package io.openbas.service;

import io.openbas.database.model.Inject;
import io.openbas.rest.scenario.response.ImportMessage;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ImportRow {
    private InjectTime injectTime;
    private List<ImportMessage> importMessages = new ArrayList<>();
    private Inject inject;
}
