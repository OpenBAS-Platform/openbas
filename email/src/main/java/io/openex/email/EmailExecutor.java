package io.openex.email;

import com.google.common.collect.ImmutableMap;
import io.openex.management.Executor;
import io.openex.management.contract.Contract;
import org.apache.camel.Component;
import org.apache.camel.component.freemarker.FreemarkerComponent;
import org.apache.camel.component.mail.MailComponent;

import static io.openex.management.contract.ContractCardinality.Multiple;
import static io.openex.management.contract.ContractType.Attachment;
import static io.openex.management.contract.ContractType.Textarea;

@SuppressWarnings("PackageAccessibility")
class EmailExecutor implements Executor {
	
	public String name() {
		return "email";
	}
	
	@Override
	public Contract contract() {
		return Contract.build()
				.mandatory("sender")
				.mandatory("subject")
				.mandatory("body", Textarea)
				.optional("attachments", Attachment, Multiple);
	}
	
	@Override
	public ImmutableMap<String, Component> components() {
		return ImmutableMap.of("smtp", new MailComponent(), "freemarker", new FreemarkerComponent());
	}
}
