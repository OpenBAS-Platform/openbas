package io.openex.management.rest;

import org.apache.camel.Body;

/**
 * Created by Julien on 16/10/2016.
 */
public interface AuditWorker {
	String auditMessage(@Body Object body);
}
