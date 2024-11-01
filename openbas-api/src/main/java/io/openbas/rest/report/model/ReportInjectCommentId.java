package io.openbas.rest.report.model;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

public class ReportInjectCommentId implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  private String injectId;
  private UUID reportId;

  public ReportInjectCommentId() {
    // Default constructor
  }
}
