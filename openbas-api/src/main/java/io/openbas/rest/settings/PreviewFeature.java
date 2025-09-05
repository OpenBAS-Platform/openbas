package io.openbas.rest.settings;

/*
 * Currently available feature flags.
 *
 * Each option here designates a feature that is disabled by default.
 * Adding any of these flags to the `enabled_dev_features` configuration
 * key will enable the corresponding feature.
 * Over time, features that are hidden by these flags will be enabled globally
 * and their corresponding flag will be removed from this enum.
 */
public enum PreviewFeature {
  // Reserved for internal use.
  _RESERVED,
  OPENAEV_REGISTRATION;

  public static PreviewFeature fromStringIgnoreCase(String str) {
    for (PreviewFeature feature : PreviewFeature.values()) {
      if (feature.name().equalsIgnoreCase(str)) {
        return feature;
      }
    }
    throw new IllegalArgumentException("No preview feature found with name " + str);
  }
}
