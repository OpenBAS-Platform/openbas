package io.openex.player.contract;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContractType {
	@JsonProperty("text")
	Text,
	@JsonProperty("checkbox")
	Checkbox,
	@JsonProperty("textarea")
	Textarea,
	@JsonProperty("richtextarea")
	Richtextarea,
	@JsonProperty("attachment")
	Attachment
}
