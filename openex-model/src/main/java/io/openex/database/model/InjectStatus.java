package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.converter.ExecutionConverter;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "injects_statuses")
public class InjectStatus implements Base {
    @Id
    @Column(name = "status_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("status_id")
    private String id;

    @Column(name = "status_name")
    @JsonProperty("status_name")
    private String name;

    @Column(name = "status_async_id")
    @JsonProperty("status_async_id")
    private String asyncId;

    @Column(name = "status_reporting")
    @Convert(converter = ExecutionConverter.class)
    @JsonProperty("status_reporting")
    private Execution reporting;

    @Column(name = "status_date")
    @JsonProperty("status_date")
    private Instant date;

    @Column(name = "status_execution")
    @JsonProperty("status_execution")
    private Integer executionTime;

    @OneToOne
    @JoinColumn(name = "status_inject")
    @JsonIgnore
    private Inject inject;

    // region transient
    public static InjectStatus fromExecution(Execution execution, Inject inject) {
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setAsyncId(execution.getAsyncId());
        injectStatus.setInject(inject);
        injectStatus.setDate(now());
        if (execution.isSynchronous()) {
            injectStatus.setExecutionTime(execution.getExecutionTime());
            injectStatus.setName(execution.getStatus().name());
        } else {
            injectStatus.setName(ExecutionStatus.PENDING.name());
        }
        injectStatus.setReporting(execution);
        return injectStatus;
    }
    // endregion

    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return inject.isUserHasAccess(user);
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Execution getReporting() {
        return reporting;
    }

    public void setReporting(Execution reporting) {
        this.reporting = reporting;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    @SuppressWarnings("unused")
    public Integer getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(Integer executionTime) {
        this.executionTime = executionTime;
    }

    public String getAsyncId() {
        return asyncId;
    }

    public void setAsyncId(String asyncId) {
        this.asyncId = asyncId;
    }

    public Inject getInject() {
        return inject;
    }

    public void setInject(Inject inject) {
        this.inject = inject;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !Base.class.isAssignableFrom(o.getClass())) return false;
        Base base = (Base) o;
        return id.equals(base.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
