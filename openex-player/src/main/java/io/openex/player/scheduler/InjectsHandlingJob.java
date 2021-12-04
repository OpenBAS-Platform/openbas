package io.openex.player.scheduler;

import io.openex.player.model.execution.Execution;
import io.openex.player.model.inject.InjectBase;
import io.openex.player.model.inject.InjectWrapper;
import io.openex.player.utils.Executor;
import io.openex.player.utils.HttpCaller;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

@Component
public class InjectsHandlingJob implements Job {

    @Resource
    private HttpCaller httpCaller;

    private ApplicationContext context;

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            List<InjectWrapper> injects = httpCaller.getInjects();
            for (InjectWrapper inject : injects) {
                Class<? extends Executor<?>> executorClass = inject.getInject().executor();
                @SuppressWarnings("unchecked")
                Executor<InjectBase> executor = (Executor<InjectBase>) context.getBean(executorClass);
                Execution execution = executor.execute(inject.getInject());
                String callbackUrl = inject.getContext().getCallbackUrl();
                httpCaller.executionReport(execution, callbackUrl);
            }
        } catch (Exception e) {
            throw new JobExecutionException(e);
        }
    }
}
