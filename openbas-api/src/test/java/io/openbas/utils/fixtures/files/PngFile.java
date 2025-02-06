package io.openbas.utils.fixtures.files;

public class PngFile extends BaseFile<byte[]> {
  public PngFile(byte[] data, String name) {
    super(data, name);
  }

  @Override
  public String getMimeType() {
    return "image/png";
  }

  @Override
  public byte[] getContentBytes() {
    return getContent();
  }
}
