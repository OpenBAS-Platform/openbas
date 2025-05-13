package io.openbas.rest.inject.service.queue;

import java.util.List;

public interface QueueExecution<T> {
  void perform(List<T> elements);
}
