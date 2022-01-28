package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.execution.Executor;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static java.util.Optional.of;

@Entity
@Table(name = "dryinjects")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@EntityListeners(ModelBaseListener.class)
public class DryInject extends Injection implements Base {

    @Id
    @Column(name = "dryinject_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("dryinject_id")
    private String id;

    @Column(name = "dryinject_date")
    @JsonProperty("dryinject_date")
    private Instant date;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dryinject_dryrun")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("dryinject_dryrun")
    private Dryrun run;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dryinject_inject")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("dryinject_inject")
    private Inject inject;

    @OneToOne(mappedBy = "dryInject", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonProperty("dryinject_status")
    private DryInjectStatus status;

    @Override
    @JsonProperty("dryinject_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    public Exercise getExercise() {
        return getRun().getExercise();
    }

    @Override
    public Class<? extends Executor<?>> executor() {
        return getInject().executor();
    }

    @Override
    public List<InjectDocument> getDocuments() {
        return getInject().getDocuments();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Dryrun getRun() {
        return run;
    }

    public void setRun(Dryrun run) {
        this.run = run;
    }

    public Inject getInject() {
        return inject;
    }

    public void setInject(Inject inject) {
        this.inject = inject;
    }

    public Optional<Instant> getDate() {
        return of(date);
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public DryInjectStatus getStatus() {
        return status;
    }

    public void setStatus(DryInjectStatus status) {
        this.status = status;
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
