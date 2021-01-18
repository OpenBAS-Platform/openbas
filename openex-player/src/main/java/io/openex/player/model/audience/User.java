package io.openex.player.model.audience;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashMap;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class User {

    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String pgpKey;
    private String comcheckId;
    private Organization organization;

    public Map<String, Object> toMarkerMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("NOM", firstname);
        map.put("PRENOM", lastname);
        map.put("ORGANISATION", organization != null ? organization.getName() : "");
        map.put("user_comcheck_id", comcheckId);
        return map;
    }

    @JsonProperty("user_firstname")
    public String getFirstname() {
        return firstname;
    }
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    @JsonProperty("user_lastname")
    public String getLastname() {
        return lastname;
    }
    public void setLastname(String lastname) {
        this.lastname = lastname;
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

    @JsonProperty("user_phone")
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }

    @JsonProperty("user_pgp_key")
    public String getPgpKey() {
        return pgpKey;
    }
    public void setPgpKey(String pgpKey) {
        this.pgpKey = pgpKey;
    }

    @JsonProperty("user_comcheck_id")
    public String getComcheckId() {
        return comcheckId;
    }
    public void setComcheckId(String comcheckId) {
        this.comcheckId = comcheckId;
    }
}
