package io.openbas.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ExecutionProcess {

    private boolean async;

    private List<Expectation> expectations;

    public ExecutionProcess(boolean async, List<Expectation> expectations) {
        this.async = async;
        this.expectations = expectations;
    }
}
