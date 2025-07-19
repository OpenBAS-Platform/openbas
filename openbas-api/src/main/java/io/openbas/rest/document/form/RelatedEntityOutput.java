package io.openbas.rest.document.form;

import lombok.Builder;

@Builder
public record RelatedEntityOutput(String id, String name, String context) {}
