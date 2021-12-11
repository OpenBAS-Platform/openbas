package io.openex.player.injects.ovh_sms;

import io.openex.player.helper.InjectHelper;
import io.openex.player.injects.ovh_sms.model.OvhSmsContent;
import io.openex.player.injects.ovh_sms.service.OvhSmsService;
import io.openex.player.model.database.Injection;
import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.model.execution.Execution;
import io.openex.player.model.execution.ExecutionStatus;
import io.openex.player.model.execution.UserInjectContext;
import io.openex.player.model.Executor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class OvhSmsExecutor implements Executor<OvhSmsContent> {

    private OvhSmsService smsService;
    private InjectHelper injectHelper;

    @Autowired
    public void setSmsService(OvhSmsService smsService) {
        this.smsService = smsService;
    }

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
        this.injectHelper = injectHelper;
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
