package io.openbas.telemetry;

import jakarta.servlet.annotation.WebListener;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

@Component
@WebListener
public class SessionCounterListener implements HttpSessionListener {

  private final AtomicInteger activeSessions;

  public SessionCounterListener() {
    super();
    activeSessions = new AtomicInteger();
  }

  public void sessionCreated(HttpSessionEvent se) {
    activeSessions.incrementAndGet();
  }

  public void sessionDestroyed(HttpSessionEvent se) {
    activeSessions.decrementAndGet();
  }

  public int getActiveSessions() {
    return activeSessions.get();
  }
}
