package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static java.time.Instant.now;

@Entity
@Table(name = "lessons_templates")
@EntityListeners(ModelBaseListener.class)
@Data
public class LessonsTemplate implements Base {

    @Id
    @Column(name = "lessons_template_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("lessonstemplate_id")
    @NotBlank
    private String id;

    @Column(name = "lessons_template_created_at")
    @JsonProperty("lessons_template_created_at")
    @NotNull
    private Instant created = now();

    @Column(name = "lessons_template_updated_at")
    @JsonProperty("lessons_template_updated_at")
    @NotNull
    private Instant updated = now();

    @Queryable(sortable = true)
    @Column(name = "lessons_template_name")
    @JsonProperty("lessons_template_name")
    @NotBlank
    private String name;

    @Queryable(sortable = true)
    @Column(name = "lessons_template_description")
    @JsonProperty("lessons_template_description")
    private String description;

    @OneToMany(mappedBy = "template", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<LessonsTemplateCategory> categories = new ArrayList<>();

    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin();
    }

}
