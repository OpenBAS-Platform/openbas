package io.openbas.database.repository;

import io.openbas.utils.Constants;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Data;

@Data
public class DenormalizationQueryBuilder {

  private String tableName;
  private String pkField;
  private String updatedAtField;
  private List<String> attributes = new ArrayList<>();
  private List<DenormMultipleRelation> relations = new ArrayList<>();
  private int aliasCounter = 0;

  public DenormalizationQueryBuilder(String tableName, String pkField, String updatedAtField) {
    this.tableName = tableName;
    this.pkField = pkField;
    this.updatedAtField = updatedAtField;
  }

  public DenormalizationQueryBuilder addDenormAttribute(String attribute) {
    this.attributes.add(attribute);
    return this;
  }

  @FunctionalInterface
  private interface ApplyFunction {
    String apply(DenormMultipleRelation relation);
  }

  public enum SelectOption implements ApplyFunction {
    ARRAY_AGG(
        rel ->
            "array_agg(DISTINCT "
                + rel.tableAlias
                + "."
                + rel.attribute
                + ") FILTER (WHERE "
                + rel.tableAlias
                + "."
                + rel.attribute
                + " IS NOT NULL ) as "
                + rel.attributeAlias),
    ARRAY_UNION_AGG(
        rel ->
            "array_union_agg("
                + rel.tableAlias
                + "."
                + rel.attribute
                + ") FILTER (WHERE "
                + rel.tableAlias
                + "."
                + rel.attribute
                + " IS NOT NULL ) as "
                + rel.attributeAlias),
    MAX(rel -> "MAX(" + rel.tableAlias + "." + rel.attribute + ") as " + rel.attributeAlias);

    private ApplyFunction fun;

    SelectOption(ApplyFunction fun) {
      this.fun = fun;
    }

    @Override
    public String apply(DenormMultipleRelation relation) {
      return this.fun.apply(relation);
    }
  }

  private record DenormMultipleRelation(
      String joinTable,
      String attribute,
      String tableAlias,
      String attributeAlias,
      SelectOption option) {}

  public DenormalizationQueryBuilder addDenormMultipleRelation(
      String joinTable, String attribute, String alias, SelectOption option) {
    this.relations.add(
        new DenormMultipleRelation(joinTable, attribute, "r" + aliasCounter++, alias, option));
    return this;
  }

  public String buildSubQuery() {
    String subQuery =
        "SELECT " + attributes.stream().map(att -> "s." + att).collect(Collectors.joining(", "));
    subQuery += ", ";
    subQuery +=
        relations.stream().map(rel -> rel.option.apply(rel)).collect(Collectors.joining(", "));
    subQuery += ", GREATEST(s." + updatedAtField + ") as updated_at FROM " + tableName + " s ";
    subQuery +=
        relations.stream()
            .map(
                rel ->
                    "LEFT JOIN "
                        + rel.joinTable
                        + " "
                        + rel.tableAlias
                        + " ON s."
                        + pkField
                        + " = "
                        + rel.tableAlias
                        + "."
                        + pkField)
            .collect(Collectors.joining(" "));
    subQuery += " GROUP BY ";
    subQuery += attributes.stream().map(att -> "s." + att).collect(Collectors.joining(", "));
    return subQuery;
  }

  public String build() {
    return "SELECT * FROM ("
        + buildSubQuery()
        + ") t WHERE t.updated_at > :from ORDER BY t.updated_at ASC LIMIT "
        + Constants.INDEXING_RECORD_SET_SIZE;
  }

  // TODO to finish with the ExerciseRepository.findForIndexing example
  public static void main(String[] args) {
    String query =
        new DenormalizationQueryBuilder("exercises", "exercise_id", "exercise_updated_at")
            .addDenormAttribute("exercise_id")
            .addDenormAttribute("exercise_name")
            .addDenormAttribute("exercise_status")
            .addDenormAttribute("exercise_created_at")
            .addDenormMultipleRelation(
                "exercises_tags", "tag_id", "exercise_tags", SelectOption.ARRAY_AGG)
            .addDenormMultipleRelation(
                "exercises_teams", "team_id", "exercise_teams", SelectOption.ARRAY_AGG)
            .addDenormMultipleRelation(
                "scenarios_exercises", "scenario_id", "scenario_id", SelectOption.MAX)
            .build();
    System.out.println(query);
  }
}
