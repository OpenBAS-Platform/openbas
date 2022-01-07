package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.database.model.basic.BasicInject;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static java.util.stream.StreamSupport.stream;

@Entity
@Table(name = "organizations")
@EntityListeners(ModelBaseListener.class)
public class Organization implements Base {
    @Id
    @Column(name = "organization_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("organization_id")
    private String id;

    @Column(name = "organization_name")
    @JsonProperty("organization_name")
    private String name;

    @Column(name = "organization_description")
    @JsonProperty("organization_description")
    private String description;

    @Column(name = "organization_created_at")
    @JsonProperty("organization_created_at")
    private Date createdAt = new Date();

    @Column(name = "organization_updated_at")
    @JsonProperty("organization_updated_at")
    private Date updatedAt = new Date();

    @OneToMany(mappedBy = "organization", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> users = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "organizations_tags",
            joinColumns = @JoinColumn(name = "organization_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("organization_tags")
    @Fetch(FetchMode.SUBSELECT)
    private List<Tag> tags = new ArrayList<>();

    // region transient
    private transient List<BasicInject> injects = new ArrayList<>();
    public void resolveInjects(Iterable<BasicInject> injects) {
        this.injects = stream(injects.spliterator(), false)
                .filter(inject -> inject.isAllAudiences() || inject.getAudiences().stream()
                        .anyMatch(audience -> getUsers().stream()
                                .flatMap(user -> user.getAudiences().stream()).toList()
                                .contains(audience)))
                .collect(Collectors.toList());
    }

    @JsonProperty("organization_injects")
    @JsonSerialize(using = MultiModelDeserializer.class)
    public List<BasicInject> getOrganizationInject() {
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

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
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
