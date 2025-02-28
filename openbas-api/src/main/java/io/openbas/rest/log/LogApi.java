package io.openbas.rest.log;

import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.log.form.LogDetailsInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LogApi extends RestBehavior {


  private static final Logger logger = LoggerFactory.getLogger(LogApi.class);

  public enum LogLevel {
    INFO, WARN, DEBUG, ERROR;

    public static LogLevel fromString(String level) {
      try {
        return LogLevel.valueOf(level.toUpperCase());
      } catch (IllegalArgumentException e) {
        return ERROR;  // Default to ERROR if the level is invalid
      }
    }
  }

  @PostMapping("/api/logs")
  @Operation(
      summary = "Log message details",
      description = "This endpoint allows you to log messages with different severity levels (INFO, WARN, DEBUG, ERROR).",
      responses = {
          @ApiResponse(
              responseCode = "200",
              description = "Log message processed successfully",
              content = @Content(mediaType = "application/json")
          ),
          @ApiResponse(
              responseCode = "400",
              description = "Invalid input provided",
              content = @Content(mediaType = "application/json")
          )
      }
  )
  public ResponseEntity<String> logDetails(
      @Parameter(
          description = "Details of the log message, including level, message, and stacktrace.",
          required = true,
          content = @Content(
              mediaType = "application/json",
              schema = @Schema(
                  type = "object",
                  properties = {
                      @Schema(name = "level", type = "string", description = "The log level (INFO, WARN, DEBUG, ERROR)", example = "INFO"),
                      @Schema(name = "message", type = "string", description = "The log message", example = "An informational message"),
                      @Schema(name = "stack", type = "string", description = "The stacktrace associated with the log message", example = "Stacktrace here")
                  },
                  required = {"level", "message"}
              )
          )
      ) @Valid @RequestBody LogDetailsInput logDetailsInput) {

    LogLevel level = LogLevel.fromString(logDetailsInput.getLevel());

    // Log the message based on the provided level
    switch (level) {
      case WARN:
        logger.warn("Message warn received: " + logDetailsInput.getMessage() + " stacktrace: " + logDetailsInput.getStack());
        break;
      case INFO:
        logger.info("Message info received: " + logDetailsInput.getMessage() + " stacktrace: " + logDetailsInput.getStack());
        break;
      case DEBUG:
        logger.debug("Message debug received: " + logDetailsInput.getMessage() + " stacktrace: " + logDetailsInput.getStack());
        break;
      case ERROR:
      default:
        logger.error("Message error received: " + logDetailsInput.getMessage() + " stacktrace: " + logDetailsInput.getStack());
        break;
    }

    return new ResponseEntity<>("Log message processed successfully", HttpStatus.OK);
  }

}
