package io.openbas.utils;

import io.openbas.database.model.Base;
import jakarta.validation.constraints.NotNull;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.util.*;

public class CopyObjectListUtils {

    public static <T extends Base> List<T> copy(@NotNull final List<T> origins, Class<T> clazz) {
        List<T> destinations = new ArrayList<>();
        return copyCollection(origins, clazz, destinations);
    }

    public static <T extends Base> Set<T> copy(@NotNull final Set<T> origins, Class<T> clazz) {
        Set<T> destinations = new HashSet<>();
        return copyCollection(origins, clazz, destinations);
    }

    public static <T extends Base, C extends Collection<T>> C copyCollection(@NotNull final C origins, Class<T> clazz, C destinations) {
        origins.forEach(origin -> {
            try {
                T destination = clazz.getDeclaredConstructor().newInstance();
                BeanUtils.copyProperties(destination, origin);
                destinations.add(destination);
            } catch (IllegalAccessException | InvocationTargetException | InstantiationException |
                     NoSuchMethodException e) {
                throw new RuntimeException(e);
            }
        });
        return destinations;
    }

}
