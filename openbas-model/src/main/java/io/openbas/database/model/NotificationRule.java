package io.openbas.database.model;

import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "notification_rules")
@EntityListeners(ModelBaseListener.class)
public class NotificationRule {

    @Id
    @Column(name = "notification_rule_id")
    @NotBlank
    private String id;

    @Column(name = "notification_resource_type")
    @NotBlank
    @Enumerated(EnumType.STRING)
    private NotificationRuleResourceType resourceType;

    @Column(name = "notification_resource_id")
    @NotBlank
    @Queryable(searchable = true, filterable = true)
    private String resourceId;

    @Column(name = "notification_rule_trigger")
    @NotBlank
    @Enumerated(EnumType.STRING)
    private NotificationRuleTrigger trigger;

    @Column(name = "notification_rule_type")
    @NotBlank
    @Enumerated(EnumType.STRING)
    private NotificationRuleType type;

    @Column(name = "notification_rule_subject")
    @NotBlank
    private String subject;

    @JoinColumn(name = "user_id")
    @NotBlank
    @ManyToOne(fetch = FetchType.LAZY)
    @Queryable(searchable = true, filterable = true, path = "owner.id")
    private User owner;
}
