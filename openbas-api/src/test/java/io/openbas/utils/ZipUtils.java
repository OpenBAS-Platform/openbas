package io.openbas.utils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class ZipUtils {
  // not this only works
  public static String getZipEntryAsString(byte[] zipBlob, String entryName) throws IOException {
    try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBlob))) {
      ZipEntry entry;
      while ((entry = zis.getNextEntry()) != null) {
        if (entry.getName().equals(entryName)) {
          StringBuilder sb = new StringBuilder();
          byte[] buffer = new byte[1024];
          int read = 0;
          while ((read = zis.read(buffer, 0, 1024)) >= 0) {
            sb.append(new String(buffer, 0, read));
          }
          // force exit of test since we have found the correct entry
          return sb.toString();
        }
      }
      // no zip entry corresponding to expected json
      throw new IOException("Zip entry '%s' not found".formatted(entryName));
    }
  }
}
