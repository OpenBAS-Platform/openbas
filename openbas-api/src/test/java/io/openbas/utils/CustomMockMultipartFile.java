package io.openbas.utils;

import java.io.IOException;
import java.io.InputStream;
import org.springframework.mock.web.MockMultipartFile;

// A private inner class, which extends the MockMultipartFile
public class CustomMockMultipartFile extends MockMultipartFile {

  public CustomMockMultipartFile(
      String name, String originalFilename, String contentType, byte[] content) {
    super(name, originalFilename, contentType, content);
  }

  // Method is overrided, so that it throws an IOException, when it's called
  @Override
  public InputStream getInputStream() throws IOException {
    throw new IOException();
  }
}
