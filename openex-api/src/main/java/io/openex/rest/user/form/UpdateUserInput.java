package io.openex.rest.user.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class UpdateUserInput {

    @Email
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

    @JsonProperty("user_pgp_key")
    private String pgpKey;

    @JsonProperty("user_phone")
    private String phone;

    @JsonProperty("user_phone2")
    private String phone2;

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

    public String getPgpKey() {
        return pgpKey;
    }

    public void setPgpKey(String pgpKey) {
        this.pgpKey = pgpKey;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPhone2() {
        return phone2;
    }

    public void setPhone2(String phone2) {
        this.phone2 = phone2;
    }
}
