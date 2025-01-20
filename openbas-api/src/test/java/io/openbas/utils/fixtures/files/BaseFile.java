package io.openbas.utils.fixtures.files;

import lombok.Getter;

public abstract class BaseFile<T> {
  @Getter private final T content;
  @Getter private final String fileName;

  public BaseFile(T content, String fileName) {
    this.content = content;
    this.fileName = fileName;
  }

  public abstract String getMimeType();

  public abstract byte[] getContentBytes();

  public abstract int getContentLength();
}
