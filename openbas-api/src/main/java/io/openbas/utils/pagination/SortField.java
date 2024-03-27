package io.openbas.utils.pagination;

import lombok.Builder;

import javax.annotation.Nullable;

@Builder
public record SortField(String property, @Nullable String direction) {
}
