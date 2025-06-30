package io.openbas.migration;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
public class V3_98__Update_injector_contracts_predefined_expectations extends BaseJavaMigration {

  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    ResultSet results =
        select.executeQuery(
            "SELECT injector_contract_content FROM injectors_contracts WHERE injector_contract_payload is not null");

    PreparedStatement statement =
        context
            .getConnection()
            .prepareStatement(
                "UPDATE injectors_contracts SET injector_contract_content = ?::json WHERE injector_contract_payload is not null");

    ObjectMapper mapper = new ObjectMapper();

    while (results.next()) {
      ArrayNode fields = mapper.readTree((JsonParser) results.getArray("fields"));
      fields.forEach((field) -> {
        String key = field.get("key").asText();
        if (key.equals("expectations")) {
          ArrayNode predefinedExpectations = (ArrayNode) field.get("predefinedExpectations");
          ObjectNode node = mapper.createObjectNode();
          node.put("expectation_type", "VULNERABILITY");
          node.put("expectation_name", "Expect asset to not be vulnerable");
          node.put("expectation_description", "");
          node.put("expectation_score", 100.0);
          node.put("expectation_expectation_group", false);
          node.put("expectation_expiration_time", 21600);
          predefinedExpectations.add(node);
        }
      });
      String content = mapper.writeValueAsString(results);
      statement.setString(1, content);
      statement.addBatch();
    }
    statement.executeBatch();
  }
}
