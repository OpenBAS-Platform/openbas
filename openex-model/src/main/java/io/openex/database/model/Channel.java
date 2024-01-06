package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "channels")
@EntityListeners(ModelBaseListener.class)
public class Channel implements Base {
    @Id
    @Column(name = "channel_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("channel_id")
    private String id;

    @Column(name = "channel_created_at")
    @JsonProperty("channel_created_at")
    private Instant createdAt = now();

    @Column(name = "channel_updated_at")
    @JsonProperty("channel_updated_at")
    private Instant updatedAt = now();

    @Column(name = "channel_type")
    @JsonProperty("channel_type")
    private String type;

    @Column(name = "channel_name")
    @JsonProperty("channel_name")
    private String name;

    @Column(name = "channel_description")
    @JsonProperty("channel_description")
    private String description;

    @Column(name = "channel_mode")
    @JsonProperty("channel_mode")
    private String mode;

    @Column(name = "channel_primary_color_dark")
    @JsonProperty("channel_primary_color_dark")
    private String primaryColorDark;

    @Column(name = "channel_primary_color_light")
    @JsonProperty("channel_primary_color_light")
    private String primaryColorLight;

    @Column(name = "channel_secondary_color_dark")
    @JsonProperty("channel_secondary_color_dark")
    private String secondaryColorDark;

    @Column(name = "channel_secondary_color_light")
    @JsonProperty("channel_secondary_color_light")
    private String secondaryColorLight;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_logo_dark")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("channel_logo_dark")
    private Document logoDark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_logo_light")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("channel_logo_light")
    private Document logoLight;

    @Override
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getPrimaryColorDark() {
        return primaryColorDark;
    }

    public void setPrimaryColorDark(String primaryColorDark) {
        this.primaryColorDark = primaryColorDark;
    }

    public String getPrimaryColorLight() {
        return primaryColorLight;
    }

    public void setPrimaryColorLight(String primaryColorLight) {
        this.primaryColorLight = primaryColorLight;
    }

    public String getSecondaryColorDark() {
        return secondaryColorDark;
    }

    public void setSecondaryColorDark(String secondaryColorDark) {
        this.secondaryColorDark = secondaryColorDark;
    }

    public String getSecondaryColorLight() {
        return secondaryColorLight;
    }

    public void setSecondaryColorLight(String secondaryColorLight) {
        this.secondaryColorLight = secondaryColorLight;
    }

    public Document getLogoDark() {
        return logoDark;
    }

    public void setLogoDark(Document logoDark) {
        this.logoDark = logoDark;
    }

    public Document getLogoLight() {
        return logoLight;
    }

    public void setLogoLight(Document logoLight) {
        this.logoLight = logoLight;
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

    public List<Document> getLogos() {
        List<Document> logos = new ArrayList<>();
        if (logoLight != null) {
            logos.add(logoLight);
        }
        if (logoDark != null) {
            logos.add(logoDark);
        }
        return logos;
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
