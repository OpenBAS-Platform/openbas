package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static java.time.Instant.now;

@Entity
@Table(name = "communications")
@EntityListeners(ModelBaseListener.class)
public class Communication implements Base {

    @Id
    @Column(name = "communication_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
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

    @ManyToOne
    @JoinColumn(name = "communication_inject")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("communication_inject")
    private Inject inject;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "communications_users",
            joinColumns = @JoinColumn(name = "communication_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("communication_users")
    @Fetch(value = FetchMode.SUBSELECT)
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

    @JsonIgnore
    @Override
    public boolean isUserHasAccess(User user) {
        Inject inject = getInject();
        return user.isAdmin() || getUsers().contains(user) || (inject != null && inject.isUserHasAccess(user));
    }
}
