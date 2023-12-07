package io.openex.rest;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;

import static java.nio.charset.StandardCharsets.UTF_8;

@RestController
public class HomeApi {

    private static String readResourceAsString(Resource resource) {
        try (Reader reader = new InputStreamReader(resource.getInputStream(), UTF_8)) {
            return FileCopyUtils.copyToString(reader);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @GetMapping(path = "/**", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> home() {
        ClassPathResource classPathResource = new ClassPathResource("/build/index.html");
        String index = readResourceAsString(classPathResource);
        String basePath = ""; // TODO Add this in configuration
        String newIndex = index.
                replaceAll("%APP_TITLE%", "OpenEx - Crisis Exercises and Adversary Simulation Platform").
                replaceAll("%APP_DESCRIPTION%", "OpenEx is an open source platform allowing organizations to plan, schedule and conduct crisis exercises as well as adversary simulation campaign.").
                replaceAll("%APP_FAVICON%", basePath + "/static/ext/favicon.png").
                replaceAll("%APP_MANIFEST%", basePath + "/static/ext/manifest.json").
                replaceAll("%BASE_PATH%", basePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .body(newIndex);
    }
}
