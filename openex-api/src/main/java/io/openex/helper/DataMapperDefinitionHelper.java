package io.openex.helper;

import io.openex.database.model.*;

import static io.openex.database.model.DataMapper.SEPARATOR.COMMA;

public class DataMapperDefinitionHelper {

  public static DataMapper dataMapperPlayerDefinition() {
    DataMapperRepresentationProperty emailProperty = new DataMapperRepresentationProperty("email");
    DataMapperRepresentationProperty firstnameProperty = new DataMapperRepresentationProperty("firstname");
    DataMapperRepresentationProperty lastnameProperty = new DataMapperRepresentationProperty("lastname");

    DataMapperRepresentation dataMapperRepresentation = DataMapperRepresentation.builder()
        .name("Player representation")
        .clazz(User.class)
        .property(emailProperty)
        .property(firstnameProperty)
        .property(lastnameProperty)
        .build();

    return DataMapper.builder()
        .name("Player mapper")
        .type(DataMapper.TYPE.PLAYER)
        .hasHeader(true)
        .separator(COMMA)
        .representation(dataMapperRepresentation)
        .build();
  }

  public static DataMapper dataMapperAudienceDefinition() {
    // Player
    DataMapperRepresentationProperty emailProperty = new DataMapperRepresentationProperty("email");

    DataMapperRepresentation playerRepresentation = DataMapperRepresentation.builder()
        .name("Player representation")
        .clazz(User.class)
        .property(emailProperty)
        .build();

    // Audience
    DataMapperRepresentationProperty nameProperty = new DataMapperRepresentationProperty("name");
    DataMapperRepresentationProperty descriptionProperty = new DataMapperRepresentationProperty("description");
    DataMapperRepresentationProperty userProperty = new DataMapperRepresentationProperty(
        "users",
        playerRepresentation.getName()
    );

    DataMapperRepresentation audienceRepresentation = DataMapperRepresentation.builder()
        .name("Audience representation")
        .clazz(Audience.class)
        .property(nameProperty)
        .property(descriptionProperty)
        .property(userProperty)
        .build();

    return DataMapper.builder()
        .name("Audience mapper")
        .type(DataMapper.TYPE.AUDIENCE)
        .hasHeader(true)
        .separator(COMMA)
        .representation(audienceRepresentation)
        .representation(playerRepresentation)
        .build();
  }

}
