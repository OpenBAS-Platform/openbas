package io.openex.scheduler;

import io.openex.database.model.Injection;
import io.openex.helper.InjectHelper;
import io.openex.model.ExecutableInject;
import io.openex.model.Execution;
import io.openex.model.Executor;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InjectsHandlingJob<T> implements Job {

    private ApplicationContext context;
    private InjectHelper<T> injectHelper;

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Autowired
    public void setInjectHelper(InjectHelper<T> injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            List<ExecutableInject<T>> injectsToRun = injectHelper.getInjectsToRun();
            for (ExecutableInject<T> executableInject : injectsToRun) {
                Injection<T> inject = executableInject.getInject();
                Class<? extends Executor<T>> executorClass = inject.executor();
                Executor<T> executor = context.getBean(executorClass);
                Execution execution = executor.execute(executableInject);
                inject.report(execution);
            }
        } catch (Exception e) {
            throw new JobExecutionException(e);
        }
    }
}
