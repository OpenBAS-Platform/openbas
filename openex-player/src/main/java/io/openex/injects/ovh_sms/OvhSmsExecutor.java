package io.openex.injects.ovh_sms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.database.model.Injection;
import io.openex.injects.ovh_sms.form.OvhSmsForm;
import io.openex.injects.ovh_sms.model.OvhSmsContent;
import io.openex.injects.ovh_sms.service.OvhSmsService;
import io.openex.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class OvhSmsExecutor implements Executor<OvhSmsContent> {

    private OvhSmsService smsService;

    public OvhSmsExecutor(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(OvhSmsForm.class, OvhSmsContract.NAME));
    }

    @Autowired
    public void setSmsService(OvhSmsService smsService) {
        this.smsService = smsService;
    }

    @Override
    public void process(ExecutableInject<OvhSmsContent> injection, Execution execution) {
        Injection<OvhSmsContent> inject = injection.getInject();
        String message = inject.getMessage();
        List<UserInjectContext> users = injection.getUsers();
        int numberOfExpected = users.size();
        AtomicInteger errors = new AtomicInteger(0);
        users.stream().parallel().forEach(context -> {
            String phone = context.getUser().getPhone();
            String email = context.getUser().getEmail();
            if (!StringUtils.hasLength(phone)) {
                errors.incrementAndGet();
                execution.addMessage("Sms fail for " + email + ": no phone number");
            } else {
                try {
                    String callResult = smsService.sendSms(context, phone, message);
                    execution.addMessage("Sms sent to " + email + " through " + phone + " (" + callResult + ")");
                } catch (Exception e) {
                    errors.incrementAndGet();
                    execution.addMessage(e.getMessage());
                }
            }
        });
        int numberOfErrors = errors.get();
        if (numberOfErrors > 0) {
            ExecutionStatus status = numberOfErrors == numberOfExpected ? ExecutionStatus.ERROR : ExecutionStatus.PARTIAL;
            execution.setStatus(status);
        }
    }
}
