package io.openbas.service;

import java.io.InputStream;
import java.util.zip.ZipEntry;

public class ImportEntry {

  private ZipEntry entry;

  private InputStream data;

  public ImportEntry(ZipEntry entry, InputStream data) {
    this.entry = entry;
    this.data = data;
  }

  public ZipEntry getEntry() {
    return entry;
  }

  public void setEntry(ZipEntry entry) {
    this.entry = entry;
  }

  public InputStream getData() {
    return data;
  }

  public void setData(InputStream data) {
    this.data = data;
  }
}
