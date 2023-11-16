package io.openex.service;

import org.springframework.stereotype.Service;

import javax.validation.constraints.NotBlank;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;

@Service
public class FileService {

  /**
   * Read & parse a CSV file
   */
  public List<List<String>> parseCsvFile(@NotBlank final String path, @NotBlank final String separator) {
    ClassLoader classLoader = getClass().getClassLoader();
    List<List<String>> records = new ArrayList<>();
    try (InputStream inputStream = classLoader.getResourceAsStream(path)) {
      assert inputStream != null;
      try (InputStreamReader streamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
          BufferedReader reader = new BufferedReader(streamReader)) {
        String line;
        while ((line = reader.readLine()) != null) {
          String[] values = line.split(separator);
          records.add(Arrays.asList(values));
        }
      }
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    return records;
  }

  /**
   * Retrieve index from column name
   * example: A, BD
   */
  public static int columnNameToIdx(@NotBlank final String columnName) {
    List<String> split = new ArrayList<>(List.of(columnName.split("")));
    Collections.reverse(split);
    return IntStream
        .range(0, split.size())
        .map((idx) -> {
          int indexOf = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(split.get(idx));
          if (idx > 0) {
            return (indexOf + 1) * 26 * idx;
          }
          return indexOf;
        }).reduce(0, Integer::sum);
  };

}
