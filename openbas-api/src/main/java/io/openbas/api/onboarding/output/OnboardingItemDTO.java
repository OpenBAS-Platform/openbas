package io.openbas.api.onboarding.output;

import jakarta.validation.constraints.NotBlank;

public record OnboardingItemDTO(
    @NotBlank String uri, @NotBlank String labelKey, @NotBlank String videoLink) {}
