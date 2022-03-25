package io.openex.injects.lade;

import io.openex.database.model.Document;
import io.openex.database.model.InjectDocument;
import io.openex.execution.BasicExecutor;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.injects.lade.model.LadeContent;
import io.openex.injects.lade.model.LadeInject;
import io.openex.injects.lade.service.LadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component
public class LadeExecutor extends BasicExecutor<LadeInject> {

    private LadeService ladeService;

    @Autowired
    public void setLadeService(LadeService ladeService) {
        this.ladeService = ladeService;
    }

    @Override
    public void process(ExecutableInject<LadeInject> injection, Execution execution) {
        // TODO
    }
}
