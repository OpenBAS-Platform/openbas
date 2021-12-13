package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "dryinjects")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dryinject_type")
public abstract class DryInject<T> implements Base, Injection<T> {

    @Id
    @Column(name = "dryinject_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("dryinject_id")
    private String id;

    @Column(name = "dryinject_title")
    @JsonProperty("dryinject_title")
    private String title;

    @Column(name = "dryinject_type", insertable = false, updatable = false)
    @JsonProperty("dryinject_type")
    private String type;

    @Column(name = "dryinject_date")
    @JsonProperty("dryinject_date")
    private Date date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dryinject_dryrun")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("dryinject_dryrun")
    private Dryrun run;

    @OneToOne(mappedBy = "dryInject")
    @JsonProperty("dryinject_status")
    private DryInjectStatus status;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Dryrun getRun() {
        return run;
    }

    public void setRun(Dryrun run) {
        this.run = run;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public DryInjectStatus getStatus() {
        return status;
    }

    public void setStatus(DryInjectStatus status) {
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Override
    @JsonProperty("dryinject_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    public Exercise getExercise() {
        return getRun().getExercise();
    }

    @Override
    @JsonProperty("dryinject_audiences")
    public List<Audience> getAudiences() {
        return new ArrayList<>();
    }

    @Override
    public boolean isGlobalInject() {
        return false;
    }
}
