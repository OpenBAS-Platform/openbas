package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdListDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "lessons_template_categories")
@EntityListeners(ModelBaseListener.class)
@Data
public class LessonsTemplateCategory implements Base {
  @Id
  @Column(name = "lessons_template_category_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("lessonstemplatecategory_id")
  @NotBlank
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "lessons_template_category_template")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("lessons_template_category_template")
  private LessonsTemplate template;

  @Column(name = "lessons_template_category_created_at")
  @JsonProperty("lessons_template_category_created_at")
  @NotNull
  private Instant created = now();

  @Column(name = "lessons_template_category_updated_at")
  @JsonProperty("lessons_template_category_updated_at")
  @NotNull
  private Instant updated = now();

  @Column(name = "lessons_template_category_name")
  @JsonProperty("lessons_template_category_name")
  @NotBlank
  private String name;

  @Column(name = "lessons_template_category_description")
  @JsonProperty("lessons_template_category_description")
  private String description;

  @Column(name = "lessons_template_category_order")
  @JsonProperty("lessons_template_category_order")
  @NotNull
  private int order;

  @OneToMany(mappedBy = "category", fetch = FetchType.EAGER)
  @JsonProperty("lessons_template_category_questions")
  @JsonSerialize(using = MultiIdListDeserializer.class)
  private List<LessonsTemplateQuestion> questions = new ArrayList<>();

  @Override
  public boolean isUserHasAccess(User user) {
    return template.isUserHasAccess(user);
  }
}
