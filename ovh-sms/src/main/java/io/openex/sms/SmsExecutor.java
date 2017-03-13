package io.openex.sms;

import com.google.common.collect.ImmutableMap;
import io.openex.management.Executor;
import io.openex.management.contract.Contract;
import io.openex.sms.ovh.OvhSmsComponent;
import org.apache.camel.Component;
import org.apache.camel.component.freemarker.FreemarkerComponent;

import static io.openex.management.contract.ContractType.Textarea;

@SuppressWarnings("PackageAccessibility")
class SmsExecutor implements Executor {
	
	public String name() {
		return "openex_ovh_sms";
	}
	
	@Override
	public Contract contract() {
		return Contract.build().mandatory("message", Textarea);
	}
	
	@Override
	public ImmutableMap<String, Component> components() {
		return ImmutableMap.of(
				"freemarker", new FreemarkerComponent(),
				"ovhSms", new OvhSmsComponent()
		);
	}
	
	@Override
	public ImmutableMap<String, Object> beans() {
		return ImmutableMap.of("sms-headers-handler", new SmsHeaders());
	}
}
