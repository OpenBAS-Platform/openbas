package io.openbas.engine;

import io.openbas.database.audit.IndexEvent;
import io.openbas.service.EsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

import static io.openbas.database.audit.ModelBaseListener.DATA_DELETE;

@Component
public class EsListener {

    private EsService esService;

    @Autowired
    public void setEsService(EsService esService) {
        this.esService = esService;
    }

    @EventListener
    public void listenIndexEvent(IndexEvent event) {
        if (Objects.equals(event.getType(), DATA_DELETE)) {
            // TODO Combine through time to generate a real bulk delete
            this.esService.bulkDelete(List.of(event.getId()));
        }
    }
}
