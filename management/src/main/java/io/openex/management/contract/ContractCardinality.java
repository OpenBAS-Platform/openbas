package io.openex.management.contract;

import com.google.gson.annotations.SerializedName;

@SuppressWarnings("PackageAccessibility")
public enum ContractCardinality {
	@SerializedName("1") One,
	@SerializedName("n") Multiple
}
