package io.openbas.utils.fixtures;

import io.openbas.database.model.Document;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Payload;
import io.openbas.rest.payload.form.PayloadCreateInput;

import java.util.Collections;

public class PayloadInputFixture {

    public static PayloadCreateInput createDefaultPayloadCreateInputForCommandLine() {
        PayloadCreateInput input = new PayloadCreateInput();
        input.setType("Command");
        input.setName("Command line payload");
        input.setDescription("This does something, maybe");
        input.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
        input.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);
        input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});
        input.setAttackPatternsIds(Collections.emptyList());
        input.setTagIds(Collections.emptyList());

        input.setExecutor("bash");
        input.setContent("echo hello");
        return input;
    }

    public static PayloadCreateInput createDefaultPayloadCreateInputForExecutable() {
        PayloadCreateInput input = new PayloadCreateInput();
        input.setType("Executable");
        input.setName("My Executable Payload");
        input.setDescription("Executable description");
        input.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
        input.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);
        input.setPlatforms(new Endpoint.PLATFORM_TYPE[]{Endpoint.PLATFORM_TYPE.Linux});
        input.setAttackPatternsIds(Collections.emptyList());
        input.setTagIds(Collections.emptyList());
        input.setExecutableArch(Endpoint.PLATFORM_ARCH.x86_64);
        return input;
    }

    public static Document createDefaultExecutableFile() {
        Document executableFile = new Document();
        executableFile.setName("Executable file");
        executableFile.setType("text/x-sh");
        return executableFile;
    }
}
