package io.openbas.database.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.util.Strings;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Optional;

public class InjectDependencyConditions {

    public enum DependencyMode {
        and{
            @Override
            public String toString() {
                return "&&";
            }
        },
        or{
            @Override
            public String toString() {
                return "||";
            }
        };
    }

    public enum DependencyOperator {
        eq {
            @Override
            public String toString() {
                return "==";
            }
        };
    }

    @Data
    public static class InjectDependencyCondition {

        @NotNull
        private DependencyMode mode; // Between filters
        private List<Condition> conditions;

        @Override
        public String toString() {
            StringBuilder result = new StringBuilder(Strings.EMPTY);
            for (var i = 0 ; i < conditions.size() ; i++) {
                if(i > 0) {
                    result.append(mode.toString());
                    result.append(StringUtils.SPACE);
                }
                result.append(conditions.get(i).toString());
                result.append(StringUtils.SPACE);
            }
            return result.toString().trim();
        }
    }

    @Data
    public static class Condition {

        @NotNull
        private String key;
        private boolean value;
        @NotNull
        private DependencyOperator operator;

        @Override
        public String toString() {
            return String.format("%s %s %s", key, operator, value);
        }
    }
}
