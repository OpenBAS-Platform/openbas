package io.openbas.api.onboarding.output;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record OnboardingCategoryDTO(
    @NotBlank String category, @NotBlank String icon, @NotNull List<OnboardingItemDTO> items) {}
