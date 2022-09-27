package io.openex.rest.user.form.me;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.EMAIL_FORMAT;
import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class UpdateProfileInput {

    @Email(message = EMAIL_FORMAT)
    @JsonProperty("user_email")
    private String email;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("user_firstname")
    private String firstname;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("user_lastname")
    private String lastname;

    @JsonProperty("user_organization")
    private String organizationId;

    @JsonProperty("user_lang")
    private String lang;

    @JsonProperty("user_theme")
    private String theme;

    @JsonProperty("user_country")
    private String country;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public String getTheme() { return theme; }

    public void setTheme(String theme) { this.theme = theme; }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
