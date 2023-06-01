package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.annotation.Ipv4OrIpv6Constraint;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiIdDeserializer;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static java.time.Instant.now;

@Getter
@Setter
@Entity
@Table(name = "systems")
@EntityListeners(ModelBaseListener.class)
public class System implements Base {

    public enum SYSTEM_TYPE {
        ENDPOINT,
        WEBSITE,
    }

    public enum OS_TYPE {
        LINUX,
        WINDOWS,
    }

    @Id
    @Column(name = "system_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("system_id")
    private String id;

    @Column(name = "system_created_at")
    @JsonProperty("system_created_at")
    private Instant createdAt = now();

    @Column(name = "system_updated_at")
    @JsonProperty("system_updated_at")
    private Instant updatedAt = now();

    @Column(name = "system_name")
    @JsonProperty("system_name")
    private String name;

    @Column(name = "system_type")
    @JsonProperty("system_type")
    @Enumerated(EnumType.STRING)
    private SYSTEM_TYPE type;

    @Ipv4OrIpv6Constraint
    @Column(name = "system_ip")
    @JsonProperty("system_ip")
    private String ip;

    @Column(name = "system_hostname")
    @JsonProperty("system_hostname")
    private String hostname;

    @Column(name = "system_os")
    @JsonProperty("system_os")
    @Enumerated(EnumType.STRING)
    private OS_TYPE os;

    @ManyToMany(mappedBy = "systems", fetch = FetchType.LAZY)
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("system_zones")
    private List<Zone> zones = new ArrayList<>();
}
