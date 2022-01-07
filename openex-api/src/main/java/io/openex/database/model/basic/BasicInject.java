package io.openex.database.model.basic;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.model.Base;
import io.openex.helper.MultiModelDeserializer;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "injects")
public class BasicInject implements Base {

    @Id
    @Column(name = "inject_id")
    @JsonProperty("inject_id")
    private String id;

    @Column(name = "inject_all_audiences")
    @JsonProperty("inject_all_audiences")
    private boolean allAudiences;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "injects_audiences",
            joinColumns = @JoinColumn(name = "inject_id"),
            inverseJoinColumns = @JoinColumn(name = "audience_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("inject_audiences")
    private List<BasicAudience> audiences = new ArrayList<>();

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean isAllAudiences() {
        return allAudiences;
    }

    public void setAllAudiences(boolean allAudiences) {
        this.allAudiences = allAudiences;
    }

    public List<BasicAudience> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<BasicAudience> audiences) {
        this.audiences = audiences;
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
