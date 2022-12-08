package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Comparator;
import java.util.Objects;
import java.util.Optional;

import static java.util.Optional.of;

@Entity
@Table(name = "dryinjects")
@EntityListeners(ModelBaseListener.class)
public class DryInject implements Base, Injection {

    public static Comparator<DryInject> executionComparator = Comparator.comparing(o -> o.getDate().orElseThrow());

    @Id
    @Column(name = "dryinject_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("dryinject_id")
    private String id;

    @Column(name = "dryinject_date")
    @JsonProperty("dryinject_date")
    private Instant date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dryinject_dryrun")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("dryinject_dryrun")
    private Dryrun run;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dryinject_inject")
    @JsonProperty("dryinject_inject")
    private Inject inject;

    // CascadeType.ALL is required here because dry inject status are embedded
    @OneToOne(mappedBy = "dryInject", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty("dryinject_status")
    private DryInjectStatus status;

    @Override
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("dryinject_exercise")
    public Exercise getExercise() {
        return getInject().getExercise();
    }

    @Override
    public Optional<Instant> getDate() {
        return of(date);
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return getExercise().isUserHasAccess(user);
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
