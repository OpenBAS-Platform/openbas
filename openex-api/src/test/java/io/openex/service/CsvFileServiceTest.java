package io.openex.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class CsvFileServiceTest {

  @Test
  void columnNameToIdxTest() {
    int idx = CsvFileService.columnNameToIdx("E");
    assertEquals(4, idx);

    idx = CsvFileService.columnNameToIdx("BD");
    assertEquals(55, idx);
  }

}
