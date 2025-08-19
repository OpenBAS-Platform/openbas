package io.openbas.api.onboarding.dto;

import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class StepsInput {

  @NotNull List<String> steps = new ArrayList<>();
}
