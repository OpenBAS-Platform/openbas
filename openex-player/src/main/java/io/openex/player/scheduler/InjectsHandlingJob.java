package io.openex.player.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.player.helper.InjectHelper;
import io.openex.player.model.database.DryInject;
import io.openex.player.model.database.Inject;
import io.openex.player.model.database.Injection;
import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.model.execution.Execution;
import io.openex.player.model.ContentBase;
import io.openex.player.repository.DryInjectReportingRepository;
import io.openex.player.repository.InjectReportingRepository;
import io.openex.player.model.Executor;
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
    private ObjectMapper mapper;
    private InjectReportingRepository injectReportingRepository;
    private DryInjectReportingRepository dryInjectReportingRepository;
    private ApplicationContext context;
    private InjectHelper injectHelper;

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Autowired
    public void setInjectReportingRepository(InjectReportingRepository injectReportingRepository) {
        this.injectReportingRepository = injectReportingRepository;
    }

    @Autowired
    public void setDryInjectReportingRepository(DryInjectReportingRepository dryInjectReportingRepository) {
        this.dryInjectReportingRepository = dryInjectReportingRepository;
    }

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            List<ExecutableInject<?>> injectsToRun = injectHelper.getInjectsToRun();
            for (ExecutableInject<?> injection : injectsToRun) {
                Injection<?> inject = injection.getInject();
                Class<? extends Executor<?>> executorClass = inject.executor();
                Executor<? extends ContentBase> executor = context.getBean(executorClass);
                Execution execution = executor.execute(injection);
                if (injection.isDryRun()) {
                    dryInjectReportingRepository.executionSave(mapper, execution, (DryInject<?>) inject);
                } else {
                    injectReportingRepository.executionSave(mapper, execution, (Inject<?>) inject);
                }
            }
        } catch (Exception e) {
            throw new JobExecutionException(e);
        }
    }
}
