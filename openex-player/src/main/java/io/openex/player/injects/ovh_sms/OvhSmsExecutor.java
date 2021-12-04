package io.openex.player.injects.ovh_sms;

import io.openex.player.injects.ovh_sms.service.OvhSmsService;
import io.openex.player.model.audience.User;
import io.openex.player.model.execution.Execution;
import io.openex.player.model.execution.ExecutionStatus;
import io.openex.player.utils.Executor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class OvhSmsExecutor implements Executor<OvhSmsInject> {

    private OvhSmsService smsService;

    @Autowired
    public void setSmsService(OvhSmsService smsService) {
        this.smsService = smsService;
    }

    @Override
    public void process(OvhSmsInject inject, Execution execution) {
        String message = inject.getMessage();
        List<User> users = inject.getUsers();
        int numberOfExpected = users.size();
        AtomicInteger errors = new AtomicInteger(0);
        users.stream().parallel().forEach(user -> {
            String phone = user.getPhone();
            if (StringUtils.isEmpty(phone)) {
                errors.incrementAndGet();
                execution.addMessage("Sms fail for " + user.getEmail() + ": no phone number");
            } else {
                try {
                    String callResult = smsService.sendSms(user, message);
                    execution.addMessage("Sms sent to " + user.getEmail() + " through " + phone + " (" + callResult + ")");
                } catch (Exception e) {
                    // TODO ADD AN ERROR LOGGER
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
