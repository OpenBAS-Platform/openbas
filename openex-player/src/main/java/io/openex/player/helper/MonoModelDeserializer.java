package io.openex.player.helper;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import io.openex.player.model.database.Base;

import java.io.IOException;

public class MonoModelDeserializer extends StdSerializer<Base> {

    public MonoModelDeserializer() {
        this(null);
    }

    public MonoModelDeserializer(Class<Base> t) {
        super(t);
    }

    @Override
    public void serialize(Base base, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        jsonGenerator.writeString(base.getId());
    }
}
