package io.openex.management.contract;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlEnumValue;
import javax.xml.bind.annotation.XmlType;

@XmlType
@XmlEnum(String.class)
public enum ContractType {
	@XmlEnumValue("text") Text,
	@XmlEnumValue("attachment") Attachment
}
