package io.openex.rest.exercise.exports;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;

public class ExerciseExportMixins {

    @JsonIgnoreProperties(value = {"exercise_users", "exercise_organizations"})
    public static class ExerciseFileExport {
    }

    @JsonIncludeProperties(value = {
            "exercise_id",
            "exercise_name",
            "exercise_description",
            "exercise_subtitle",
            "exercise_image",
            "exercise_message_header",
            "exercise_message_footer",
            "exercise_mail_from",
            "exercise_tags",
    })
    public static class Exercise {
    }

    @JsonIncludeProperties(value = {
            "organization_id",
            "organization_name",
            "organization_description",
            "organization_tags",
    })
    public static class Organization {
    }

    @JsonIncludeProperties(value = {
            "audience_id",
            "audience_name",
            "audience_description",
            "audience_tags",
            "audience_users",
    })
    public static class Audience {
    }

    @JsonIncludeProperties(value = {
            "audience_id",
            "audience_name",
            "audience_description",
            "audience_tags",
    })
    public static class EmptyAudience {
    }

    @JsonIncludeProperties(value = {
            "inject_id",
            "inject_title",
            "inject_description",
            "inject_country",
            "inject_city",
            "inject_type",
            "inject_all_audiences",
            "inject_depends_on",
            "inject_depends_duration",
            "inject_tags",
            "inject_audiences",
            "inject_content",
    })
    public static class Inject {
    }

    @JsonIncludeProperties(value = {
            "user_id",
            "user_firstname",
            "user_lastname",
            "user_email",
            "user_phone",
            "user_pgp_key",
            "user_organization",
            "user_country",
            "user_city",
            "user_tags",
    })
    public static class User {
    }

    @JsonIncludeProperties(value = {
            "objective_id",
            "objective_title",
            "objective_description",
            "objective_priority",
    })
    public static class Objective {
    }

    @JsonIncludeProperties(value = {
            "poll_id",
            "poll_question",
    })
    public static class Poll {
    }

    @JsonIncludeProperties(value = {
            "tag_id",
            "tag_name",
            "tag_color",
    })
    public static class Tag {
    }
}


