package io.openex.migration;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.media.model.MediaContent;
import io.openex.injects.ovh_sms.model.OvhSmsContent;
import io.openex.model.inject.form.Expectation;
import lombok.Data;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;
import java.util.Objects;

import static io.openex.database.model.InjectExpectation.EXPECTATION_TYPE.ARTICLE;
import static io.openex.database.model.InjectExpectation.EXPECTATION_TYPE.MANUAL;

@Component
public class V2_63__InjectExpectation_upgrade extends BaseJavaMigration {

  public static final String EXPECTATION_MANUAL_NAME = "The animation team can validate the audience reaction";
  public static final String EXPECTATION_ARTICLE_NAME = "Expect audiences to read the article(s)";

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Upgrade Inject Expectation table
    select.execute("""
        ALTER TABLE injects_expectations ADD inject_expectation_name varchar(255);
        ALTER TABLE injects_expectations ADD inject_expectation_description text;
        """);
    // Migration datas
    ObjectMapper mapper = new ObjectMapper();
    ResultSet results = select.executeQuery("""
        SELECT * FROM injects
        WHERE inject_type = 'openex_email' OR inject_type = 'openex_ovh_sms' OR inject_type = '"openex_media"'
        """);
    PreparedStatement statement = connection.prepareStatement(
        "UPDATE injects SET inject_content = ? WHERE inject_id = ?"
    );
    while (results.next()) {
      String id = results.getString("inject_id");
      String content = results.getString("inject_content");
      String type = results.getString("inject_type");
      if (Objects.equals(type, "openex_ovh_sms")) {
        OvhSmsContentOld ovhSms = mapper.readValue(content, OvhSmsContentOld.class);
        content = mapper.writeValueAsString(ovhSms.toNewContent());
      } else if (Objects.equals(type, "openex_email")) {
        EmailContentOld email = mapper.readValue(content, EmailContentOld.class);
        content = mapper.writeValueAsString(email.toNewContent());
      } else if (Objects.equals(type, "openex_media")) {
        MediaContentOld media = mapper.readValue(content, MediaContentOld.class);
        content = mapper.writeValueAsString(media.toNewContent());
      }
      statement.setString(1, content);
      statement.setString(2, id);
      statement.addBatch();
    }
    statement.executeBatch();
  }

  @Data
  public static class OvhSmsContentOld {

    private String message;
    private String expectationType;
    private Integer expectationScore;

    OvhSmsContent toNewContent() {
      OvhSmsContent content = new OvhSmsContent();
      content.setMessage(this.message);
      Expectation expectation = new Expectation();
      expectation.setScore(this.expectationScore);
      expectation.setType(MANUAL);
      expectation.setName(EXPECTATION_MANUAL_NAME);
      content.setExpectations(List.of(expectation));
      return content;
    }
  }

  @Data
  public static class EmailContentOld {

    private String body;
    private String subject;
    private String inReplyTo;
    private boolean encrypted;
    private String expectationType;
    private Integer expectationScore;

    EmailContent toNewContent() {
      EmailContent content = new EmailContent();
      content.setBody(this.body);
      content.setSubject(this.subject);
      content.setInReplyTo(this.inReplyTo);
      content.setEncrypted(this.encrypted);
      Expectation expectation = new Expectation();
      expectation.setScore(this.expectationScore);
      expectation.setType(MANUAL);
      expectation.setName(EXPECTATION_MANUAL_NAME);
      content.setExpectations(List.of(expectation));
      return content;
    }
  }

  @Data
  public static class MediaContentOld {

    private List<String> articles;
    private boolean expectation;
    private Integer expectationScore;
    private boolean emailing;

    EmailContent toNewContent() {
      MediaContent content = new MediaContent();
      content.setArticles(this.articles);
      content.setEmailing(this.emailing);
      Expectation expectation = new Expectation();
      expectation.setScore(this.expectationScore);
      expectation.setType(ARTICLE);
      expectation.setName(EXPECTATION_ARTICLE_NAME);
      content.setExpectations(List.of(expectation));
      return content;
    }
  }
}
