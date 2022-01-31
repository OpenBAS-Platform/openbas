package io.openex.injects.ovh_sms;

import io.openex.database.model.User;
import io.openex.execution.BasicExecutor;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.ExecutionContext;
import io.openex.injects.ovh_sms.model.OvhSmsInject;
import io.openex.injects.ovh_sms.service.OvhSmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component
public class OvhSmsExecutor extends BasicExecutor<OvhSmsInject> {

    private OvhSmsService smsService;

    @Autowired
    public void setSmsService(OvhSmsService smsService) {
        this.smsService = smsService;
    }

    @Override
    public void process(ExecutableInject<OvhSmsInject> injection, Execution execution) {
        OvhSmsInject inject = injection.getInject();
        String smsMessage = inject.getContent().buildMessage(inject.getFooter(), inject.getHeader());
        List<ExecutionContext> users = injection.getUsers();
        users.stream().parallel().forEach(context -> {
            User user = context.getUser();
            String phone = user.getPhone();
            String email = user.getEmail();
            if (!StringUtils.hasLength(phone)) {
                String message = "Sms fail for " + email + ": no phone number";
                execution.addTrace(traceSuccess(user.getId(), message));
            } else {
                try {
                    String callResult = smsService.sendSms(context, phone, smsMessage);
                    String message = "Sms sent to " + email + " through " + phone + " (" + callResult + ")";
                    execution.addTrace(traceSuccess(user.getId(), message));
                } catch (Exception e) {
                    execution.addTrace(traceError(user.getId(), e.getMessage(), e));
                }
            }
        });
    }
}
