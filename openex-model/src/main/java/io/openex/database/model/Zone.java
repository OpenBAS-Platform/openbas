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
@Table(name = "zones")
@EntityListeners(ModelBaseListener.class)
public class Zone implements Base {

    @Id
    @Column(name = "zone_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("zone_id")
    private String id;

    @Column(name = "zone_name")
    @JsonProperty("zone_name")
    private String name;

    @Column(name = "zone_description")
    @JsonProperty("zone_description")
    private String description;

    @Column(name = "zone_created_at")
    @JsonProperty("zone_created_at")
    private Instant createdAt = now();

    @Column(name = "zone_updated_at")
    @JsonProperty("zone_updated_at")
    private Instant updatedAt = now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "systems_zones",
            joinColumns = @JoinColumn(name = "zone_id"),
            inverseJoinColumns = @JoinColumn(name = "system_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("zone_systems")
    private List<System> systems = new ArrayList<>();
}
