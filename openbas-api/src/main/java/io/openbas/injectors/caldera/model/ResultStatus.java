package io.openbas.injectors.caldera.model;

import lombok.Data;

import java.time.Instant;

@Data
public class ResultStatus {

  private String paw;
  private boolean complete;
  private boolean fail;
  private Instant finish;
  private String content;

}
