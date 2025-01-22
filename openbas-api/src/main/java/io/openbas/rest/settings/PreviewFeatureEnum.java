package io.openbas.rest.settings;

public enum PreviewFeatureEnum {
  _RESERVED;

  public static PreviewFeatureEnum fromStringIgnoreCase(String str) {
    for (PreviewFeatureEnum feature : PreviewFeatureEnum.values()) {
      if (feature.name().equalsIgnoreCase(str)) {
        return feature;
      }
    }
    throw new IllegalArgumentException("No preview feature found with name " + str);
  }
}
