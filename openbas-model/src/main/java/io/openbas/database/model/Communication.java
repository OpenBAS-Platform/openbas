package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdDeserializer;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "communications")
@EntityListeners(ModelBaseListener.class)
public class Communication implements Base {

    @Id
    @Column(name = "communication_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("communication_id")
    private String id;

    @Column(name = "communication_message_id")
    @JsonProperty("communication_message_id")
    private String identifier;

    @Column(name = "communication_received_at")
    @JsonProperty("communication_received_at")
    private Instant receivedAt = now();

    @Column(name = "communication_sent_at")
    @JsonProperty("communication_sent_at")
    private Instant sentAt = now();

    @Column(name = "communication_subject")
    @JsonProperty("communication_subject")
    private String subject;

    @Column(name = "communication_content")
    @JsonProperty("communication_content")
    private String content;

    @Column(name = "communication_content_html")
    @JsonProperty("communication_content_html")
    private String contentHtml;

    @Type(StringArrayType.class)
    @Column(name = "communication_attachments", columnDefinition = "text[]")
    @JsonProperty("communication_attachments")
    private String[] attachments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "communication_inject")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("communication_inject")
    private Inject inject;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "communications_users",
            joinColumns = @JoinColumn(name = "communication_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("communication_users")
    private List<User> users = new ArrayList<>();

    @Column(name = "communication_ack")
    @JsonProperty("communication_ack")
    private Boolean ack = false;

    @Column(name = "communication_animation")
    @JsonProperty("communication_animation")
    private Boolean animation = false;

    @Column(name = "communication_from")
    @JsonProperty("communication_from")
    private String from;

    @Column(name = "communication_to")
    @JsonProperty("communication_to")
    private String to;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContentHtml() {
        return contentHtml;
    }

    public void setContentHtml(String contentHtml) {
        this.contentHtml = contentHtml;
    }

    public Inject getInject() {
        return inject;
    }

    public void setInject(Inject inject) {
        this.inject = inject;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public Boolean getAck() {
        return ack;
    }

    public void setAck(Boolean ack) {
        this.ack = ack;
    }

    public Boolean getAnimation() {
        return animation;
    }

    public void setAnimation(Boolean animation) {
        this.animation = animation;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String[] getAttachments() {
        return attachments;
    }

    public void setAttachments(String[] attachments) {
        this.attachments = attachments;
    }

    @JsonProperty("communication_exercise")
    public String getExercise() {
        return this.inject.getExercise() != null ? this.inject.getExercise().getId() : StringUtils.EMPTY;
    }

    @JsonIgnore
    @Override
    public boolean isUserHasAccess(User user) {
        Inject inject = getInject();
        return user.isAdmin() || getUsers().contains(user) || (inject != null && inject.isUserHasAccess(user));
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
