package io.openbas.collectors.sentinel.utils;

public class FuzzyMatchUtils {


  public static boolean fuzzyMatch(String string1, String string2, int threashold) {
    String string1Normalized = string1.replaceAll("[\\\\\"$\\(\\)\\{\\}\\[\\]\\*\\|]", "");
    String string2Normalized = string2.replaceAll("[\\\\\\\"\\$\\(\\)\\{\\}\\[\\]\\*\\|]", "");

    string1Normalized = string1Normalized.replaceAll("\\s+", " ");
    string2Normalized = string2Normalized.replaceAll("\\s+", " ");

    int distance = calculateLevenshteinDistance(string1Normalized, string2Normalized);
    return distance <= threashold;
  }

  private static int calculateLevenshteinDistance(String keyWord, String candidate) {
    int[][] distanceMatrix = new int[keyWord.length() + 1][candidate.length() + 1];

    for (int i = 0; i <= keyWord.length(); i++) {
      distanceMatrix[i][0] = i;
    }

    for (int j = 0; j <= candidate.length(); j++) {
      distanceMatrix[0][j] = j;
    }

    for (int i = 1; i <= keyWord.length(); i++) {
      for (int j = 1; j <= candidate.length(); j++) {
        int substitutionCost = keyWord.charAt(i - 1) == candidate.charAt(j - 1) ? 0 : 1;
        distanceMatrix[i][j] = Math.min(Math.min(distanceMatrix[i - 1][j] + 1, distanceMatrix[i][j - 1] + 1),
            distanceMatrix[i - 1][j - 1] + substitutionCost);
      }
    }

    return distanceMatrix[keyWord.length()][candidate.length()];
  }

}
