package io.openex.player.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class User {

    private String firstname;
    private Organization organization;
    private String email;
    private String pgpKey;

    @JsonProperty("user_firstname")
    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    @JsonProperty("user_organization")
    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    @JsonProperty("user_email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonProperty("user_pgp_key")
    public String getPgpKey() {
        return pgpKey;
    }

    public void setPgpKey(String pgpKey) {
        this.pgpKey = pgpKey;
    }
}
