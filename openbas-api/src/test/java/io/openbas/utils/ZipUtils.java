package io.openbas.utils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.function.Function;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class ZipUtils {
  public static <T> T getZipEntry(
      byte[] zipBlob, String entryName, Function<InputStream, T> readFunc) throws IOException {
    try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBlob))) {
      ZipEntry entry;
      while ((entry = zis.getNextEntry()) != null) {
        if (entry.getName().equals(entryName)) {
          return readFunc.apply(zis);
        }
      }
      // no zip entry corresponding to expected name
      throw new IOException("Zip entry '%s' not found".formatted(entryName));
    }
  }

  public static String streamToString(InputStream is) {
    StringBuilder sb = new StringBuilder();
    byte[] buffer = new byte[1024];
    int read = 0;
    while (true) {
      try {
        if (!((read = is.read(buffer, 0, 1024)) >= 0)) break;
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
      sb.append(new String(buffer, 0, read));
    }
    return sb.toString();
  }

  public static byte[] streamToBytes(InputStream is) {
    try {
      return is.readAllBytes();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
