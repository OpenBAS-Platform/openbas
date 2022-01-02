package io.openex.rest.user.form.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UpdateUserInfoInput {

    @JsonProperty("user_pgp_key")
    private String pgpKey;

    @JsonProperty("user_phone")
    private String phone;

    @JsonProperty("user_phone2")
    private String phone2;

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
