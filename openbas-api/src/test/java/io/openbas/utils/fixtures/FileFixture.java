package io.openbas.utils.fixtures;


import io.openbas.utils.fixtures.files.PlainTextFile;


public class FileFixture {
    public static String DEFAULT_PLAIN_TEXT_CONTENT = "default plain text content";
    public static String DEFAULT_PLAIN_TEXT_FILENAME = "plain_text.txt";

    public static PlainTextFile getPlainTextFileContent() {
        return new PlainTextFile(DEFAULT_PLAIN_TEXT_CONTENT, DEFAULT_PLAIN_TEXT_FILENAME);
    }
}
