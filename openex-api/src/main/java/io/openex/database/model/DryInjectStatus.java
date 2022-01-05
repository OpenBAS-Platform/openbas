package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.audit.ModelBaseListener;
import io.openex.database.converter.StatusReportingConverter;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "dryinjects_statuses")
@EntityListeners(ModelBaseListener.class)
public class DryInjectStatus implements Base {
    @Id
    @Column(name = "status_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("status_id")
    private String id;

    @Column(name = "status_name")
    @JsonProperty("status_name")
    private String name;

    @Column(name = "status_message")
    @Convert(converter = StatusReportingConverter.class)
    @JsonProperty("status_message")
    private StatusReporting reporting;

    @Column(name = "status_date")
    @JsonProperty("status_date")
    private Date date;

    @Column(name = "status_execution")
    @JsonProperty("status_execution")
    private Integer executionTime;

    @OneToOne
    @JoinColumn(name = "status_dryinject")
    @JsonIgnore
    private DryInject<?> dryInject;

    public String getId() {
        return id;
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

    public StatusReporting getReporting() {
        return reporting;
    }

    public void setReporting(StatusReporting reporting) {
        this.reporting = reporting;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Integer getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(Integer executionTime) {
        this.executionTime = executionTime;
    }

    public DryInject<?> getDryInject() {
        return dryInject;
    }

    public void setDryInject(DryInject<?> dryInject) {
        this.dryInject = dryInject;
    }
}
