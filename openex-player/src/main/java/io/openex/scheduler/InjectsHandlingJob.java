package io.openex.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.DryInject;
import io.openex.database.model.Inject;
import io.openex.database.model.Injection;
import io.openex.database.repository.DryInjectReportingRepository;
import io.openex.database.repository.InjectReportingRepository;
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

import javax.annotation.Resource;
import java.util.List;

@Component
public class InjectsHandlingJob<T> implements Job {

    @Resource
    private ObjectMapper mapper;
    private InjectReportingRepository injectReportingRepository;
    private DryInjectReportingRepository dryInjectReportingRepository;
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
            List<ExecutableInject<T>> injectsToRun = injectHelper.getInjectsToRun();
            for (ExecutableInject<?> injection : injectsToRun) {
                Injection<?> inject = injection.getInject();
                Class<? extends Executor<?>> executorClass = inject.executor();
                Executor<?> executor = context.getBean(executorClass);
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
