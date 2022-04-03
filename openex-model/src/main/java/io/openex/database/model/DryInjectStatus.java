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
@Table(name = "dryinjects_statuses")
public class DryInjectStatus implements Base {
    @Id
    @Column(name = "status_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("status_id")
    private String id;

    @Column(name = "status_name")
    @JsonProperty("status_name")
    @Enumerated(EnumType.STRING)
    private ExecutionStatus name;

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
    @JoinColumn(name = "status_dryinject")
    @JsonIgnore
    private DryInject dryInject;

    // region transient
    @JsonIgnore
    public static DryInjectStatus fromExecution(Execution execution, DryInject dry) {
        DryInjectStatus injectStatus = new DryInjectStatus();
        injectStatus.setDryInject(dry);
        injectStatus.setDate(now());
        injectStatus.setExecutionTime(execution.getExecutionTime());
        injectStatus.setName(execution.getStatus());
        injectStatus.setReporting(execution);
        return injectStatus;
    }
    // endregion

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ExecutionStatus getName() {
        return name;
    }

    public void setName(ExecutionStatus name) {
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

    public Integer getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(Integer executionTime) {
        this.executionTime = executionTime;
    }

    public DryInject getDryInject() {
        return dryInject;
    }

    public void setDryInject(DryInject dryInject) {
        this.dryInject = dryInject;
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
