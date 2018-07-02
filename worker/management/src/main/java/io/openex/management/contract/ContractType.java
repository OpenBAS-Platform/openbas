package io.openex.management.contract;

import com.google.gson.annotations.SerializedName;

@SuppressWarnings("PackageAccessibility")
public enum ContractType {
	@SerializedName("text") Text,
	@SerializedName("checkbox") Checkbox,
	@SerializedName("textarea") Textarea,
	@SerializedName("richtextarea") Richtextarea,
	@SerializedName("attachment") Attachment
}
