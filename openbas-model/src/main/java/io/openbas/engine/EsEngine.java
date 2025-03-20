package io.openbas.engine;

import io.openbas.engine.handler.FindingHandler;
import io.openbas.engine.model.EsFinding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.engine.model.EsFinding.FINDING_TYPE;

@Service
public class EsEngine {

    private ApplicationContext context;

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    public List<EsModel<?>> getModels() {
        List<EsModel<?>> models = new ArrayList<>();
        models.add(new EsModel<>(FINDING_TYPE, EsFinding.class, context.getBean(FindingHandler.class)));
        return models;
    }
}
