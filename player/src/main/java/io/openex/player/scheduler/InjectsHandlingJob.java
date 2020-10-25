package io.openex.player.scheduler;

import io.openex.player.model.Execution;
import io.openex.player.model.Inject;
import io.openex.player.utils.HttpCaller;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import javax.annotation.Resource;
import java.util.List;

public class InjectsHandlingJob implements Job {

    @Resource
    private HttpCaller httpCaller;

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            List<Inject> injects = httpCaller.getInjects();
            for (Inject inject : injects) {
                Execution execute = inject.getInject().execute();
                String callbackUrl = inject.getContext().getCallbackUrl();
                httpCaller.executionReport(execute, callbackUrl);
            }
        } catch (Exception e) {
            throw new JobExecutionException(e);
        }
    }
}
