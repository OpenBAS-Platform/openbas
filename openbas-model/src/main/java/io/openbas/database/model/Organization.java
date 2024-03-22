package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MultiIdDeserializer;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static java.time.Instant.now;
import static java.util.stream.StreamSupport.stream;

@Entity
@Table(name = "organizations")
@EntityListeners(ModelBaseListener.class)
public class Organization implements Base {
    @Id
    @Column(name = "organization_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("organization_id")
    @NotBlank
    private String id;

    @Column(name = "organization_name")
    @JsonProperty("organization_name")
    @Queryable(searchable = true)
    private String name;

    @Column(name = "organization_description")
    @JsonProperty("organization_description")
    private String description;

    @Column(name = "organization_created_at")
    @JsonProperty("organization_created_at")
    private Instant createdAt = now();

    @Column(name = "organization_updated_at")
    @JsonProperty("organization_updated_at")
    private Instant updatedAt = now();

    @OneToMany(mappedBy = "organization", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> users = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "organizations_tags",
            joinColumns = @JoinColumn(name = "organization_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("organization_tags")
    private List<Tag> tags = new ArrayList<>();

    // region transient
    private transient List<Inject> injects = new ArrayList<>();
    public void resolveInjects(Iterable<Inject> injects) {
        this.injects = stream(injects.spliterator(), false)
                .filter(inject -> inject.isAllTeams() || inject.getTeams().stream()
                        .anyMatch(team -> getUsers().stream()
                                .flatMap(user -> user.getTeams().stream()).toList()
                                .contains(team)))
                .collect(Collectors.toList());
    }

    @JsonProperty("organization_injects")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<Inject> getOrganizationInject() {
        return injects;
    }

    @JsonProperty("organization_injects_number")
    public long getOrganizationInjectsNumber() {
        return injects.size();
    }
    // endregion

    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
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
