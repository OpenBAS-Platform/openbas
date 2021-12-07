package io.openex.player.model.audience;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.*;

import static java.util.Arrays.asList;
import static java.util.List.of;

@JsonIgnoreProperties(ignoreUnknown = true)
public class User {

    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String pgpKey;
    private String comcheckId;
    private Organization organization;
    private List<String> audiences = new ArrayList<>();

    private Map<String, Object> addMarker(List<String> keys, Object value) {
        Map<String, Object> map = new HashMap<>();
        for (String key : keys) {
            map.put(key.toUpperCase(), value);
            map.put(key.toLowerCase(), value);
        }
        return map;
    }
    public Map<String, Object> toMarkerMap() {
        Map<String, Object> map = new HashMap<>();
        map.putAll(addMarker(asList("NOM", "FIRSTNAME"), firstname));
        map.putAll(addMarker(asList("PRENOM", "LASTNAME"), lastname));
        String organizationName = organization != null ? organization.getName() : "";
        map.putAll(addMarker(asList("ORGANISATION", "ORGANIZATION"), organizationName));
        map.putAll(addMarker(of("USER_COMCHECK_ID"), comcheckId));
        map.putAll(addMarker(of("AUDIENCES"), String.join(", ", audiences)));
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

    @JsonProperty("user_audiences")
    public List<String> getAudiences() {
        return audiences;
    }
    public void setAudiences(List<String> audiences) {
        this.audiences = audiences;
    }
}
