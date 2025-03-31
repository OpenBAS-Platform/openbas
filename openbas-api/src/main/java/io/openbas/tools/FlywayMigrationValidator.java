package io.openbas.tools;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class FlywayMigrationValidator {

  private FlywayMigrationValidator() {
  }

  private static final Pattern VERSION_PATTERN = Pattern.compile("^V(\\d+(?:_\\d+)*)__.*\\.class$");
  public static final String OPENBAS_MIGRATION_PATH = "io/openbas/migration";

  public static void validateFlywayMigrationNames() {
    try {
      Path migrationDir = Paths.get(
          FlywayMigrationValidator.class.getProtectionDomain().getCodeSource().getLocation().toURI()
      ).resolve(OPENBAS_MIGRATION_PATH);

      if (!Files.exists(migrationDir)) {
        return;
      }

      Map<String, List<String>> versionToFiles = new HashMap<>();

      try (Stream<Path> files = Files.walk(migrationDir)) {
        files
            .filter(Files::isRegularFile)
            .filter(p -> p.getFileName().toString().startsWith("V"))
            .filter(p -> p.toString().endsWith(".class"))
            .filter(p -> !p.getFileName().toString().contains("$")) // Ignore internal classes
            .forEach(p -> {
              String fileName = p.getFileName().toString();
              Matcher matcher = VERSION_PATTERN.matcher(fileName);
              if (matcher.matches()) {
                String version = matcher.group(1).replace('_', '.');
                versionToFiles
                    .computeIfAbsent(version, k -> new ArrayList<>())
                    .add(fileName);
              }
            });
      }

      versionToFiles.entrySet().stream()
          .filter(e -> e.getValue().size() > 1)
          .findAny()
          .ifPresent(e -> {
            throw new IllegalStateException("Duplicate Flyway migration version found: " +
                e.getKey() + " → " + e.getValue());
          });

    } catch (URISyntaxException | IOException e) {
      throw new RuntimeException("Error during Flyway migration validation", e);
    }
  }
}
