package io.openbas.rest.finding.form;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ExecutionTreeNode {

  private String injectTitle;
  private String executionId;
  private String argumentKey;
  private String argumentValue;
  private List<ExecutionTreeNode> parents = new ArrayList<>();
}
