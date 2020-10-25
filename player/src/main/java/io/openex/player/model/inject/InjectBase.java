package io.openex.player.model.inject;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openex.player.utils.Executor;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class InjectBase {

    public abstract Class<? extends Executor<?>> executor();
}
