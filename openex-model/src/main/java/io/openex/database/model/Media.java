package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "medias")
@EntityListeners(ModelBaseListener.class)
public class Media implements Base {
    @Id
    @Column(name = "media_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("media_id")
    private String id;

    @Column(name = "media_created_at")
    @JsonProperty("media_created_at")
    private Instant createdAt = now();

    @Column(name = "media_updated_at")
    @JsonProperty("media_updated_at")
    private Instant updatedAt = now();

    @Column(name = "media_name")
    @JsonProperty("media_name")
    private String name;

    @Column(name = "media_color")
    @JsonProperty("media_color")
    private String color;

    @Column(name = "media_published")
    @JsonProperty("media_published")
    private boolean published;

    @Override
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
        this.name = name.toLowerCase();
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color.toLowerCase();
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

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
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
