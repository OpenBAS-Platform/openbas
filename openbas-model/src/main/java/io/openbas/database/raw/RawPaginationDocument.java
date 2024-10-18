package io.openbas.database.raw;

import io.openbas.database.model.Document;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Tag;
import lombok.Data;

import java.util.List;

@Data
public class RawPaginationDocument {

  String document_id;
  String document_name;
  String document_description;
  List<String> document_exercises;
  List<String> document_scenarios;
  String document_type;
  List<String> document_tags;
  boolean document_can_be_deleted = true;

  public RawPaginationDocument(final Document document) {
    this.document_id = document.getId();
    this.document_name = document.getName();
    this.document_description = document.getDescription();
    this.document_exercises = document.getExercises().stream().map(Exercise::getId).toList();
    this.document_scenarios = document.getScenarios().stream().map(Scenario::getId).toList();
    this.document_type = document.getType();
    this.document_tags = document.getTags().stream().map(Tag::getId).toList();
  }
}
