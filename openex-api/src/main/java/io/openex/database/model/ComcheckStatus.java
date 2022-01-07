package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;
import java.util.Objects;

@Entity
@Table(name = "comchecks_statuses")
@EntityListeners(ModelBaseListener.class)
public class ComcheckStatus implements Base {
    @Id
    @Column(name = "status_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("status_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "status_user")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("status_user")
    private User user;

    @ManyToOne
    @JoinColumn(name = "status_comcheck")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("status_comcheck")
    private Comcheck comcheck;

    @Column(name = "status_last_update")
    @JsonProperty("status_last_update")
    private Date lastUpdate;

    @Column(name = "status_state")
    @JsonProperty("status_state")
    private boolean state;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Comcheck getComcheck() {
        return comcheck;
    }

    public void setComcheck(Comcheck comcheck) {
        this.comcheck = comcheck;
    }

    public boolean isState() {
        return state;
    }

    public void setState(boolean state) {
        this.state = state;
    }

    public Date getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(Date lastUpdate) {
        this.lastUpdate = lastUpdate;
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
