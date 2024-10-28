package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class InjectExpectationUpdateInput {
  @NotNull
  @JsonProperty("collector_id")
  private String collectorId;

  @NotNull
  @JsonProperty("result")
  private String result;

  @NotNull
  @JsonProperty("is_success")
  private Boolean isSuccess;

  public String getCollectorId() {
    return collectorId;
  }

  public void setCollectorId(String collectorId) {
    this.collectorId = collectorId;
  }

  public String getResult() {
    return result;
  }

  public void setResult(String result) {
    this.result = result;
  }

  public Boolean getSuccess() {
    return isSuccess;
  }

  public void setSuccess(Boolean success) {
    isSuccess = success;
  }
}
