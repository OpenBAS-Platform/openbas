package io.openex.player.model.database;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.player.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "tokens")
public class Token implements Base {
    @Id
    @Column(name = "token_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("token_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "token_user")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("token_user")
    private User user;

    @Column(name = "token_value")
    @JsonProperty("token_value")
    private String value;

    @Column(name = "token_created_at")
    @JsonProperty("token_created_at")
    private Date created;

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

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }
}
