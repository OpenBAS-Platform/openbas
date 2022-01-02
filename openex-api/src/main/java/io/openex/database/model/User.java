package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.CryptoHelper;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import javax.persistence.*;
import java.util.*;

import static io.openex.database.model.Grant.GRANT_TYPE.PLANNER;

@Entity
@Table(name = "users")
public class User implements Base, OAuth2User {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_USER = "ROLE_USER";

    @Id
    @Column(name = "user_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("user_id")
    private String id;

    @Column(name = "user_firstname")
    @JsonProperty("user_firstname")
    private String firstname;

    @Column(name = "user_lastname")
    @JsonProperty("user_lastname")
    private String lastname;

    @Column(name = "user_lang")
    @JsonProperty("user_lang")
    private String lang = "auto";

    @Column(name = "user_email")
    @JsonProperty("user_email")
    private String email;

    @Column(name = "user_phone")
    @JsonProperty("user_phone")
    private String phone;

    @Column(name = "user_phone2")
    @JsonProperty("user_phone2")
    private String phone2;

    @Column(name = "user_pgp_key")
    @JsonProperty("user_pgp_key")
    private String pgpKey;

    @Column(name = "user_status")
    @JsonProperty("user_status")
    private Short status = 0;

    @Column(name = "user_password")
    @JsonIgnore
    private String password;

    @Column(name = "user_created_at")
    @JsonProperty("user_created_at")
    private Date createdAt = new Date();

    @Column(name = "user_updated_at")
    @JsonProperty("user_updated_at")
    private Date updatedAt = new Date();

    @ManyToOne
    @JoinColumn(name = "user_organization")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("user_organization")
    private Organization organization;

    @Column(name = "user_admin")
    @JsonProperty("user_admin")
    private boolean admin = false;

    @Column(name = "user_latitude")
    @JsonProperty("user_latitude")
    private Double latitude;

    @Column(name = "user_longitude")
    @JsonProperty("user_longitude")
    private Double longitude;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Token> tokens = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_groups",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "group_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("user_groups")
    @Fetch(FetchMode.SUBSELECT)
    private List<Group> groups = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_audiences",
            joinColumns = @JoinColumn(name = "audience_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("user_audiences")
    @Fetch(FetchMode.SUBSELECT)
    private List<Audience> audiences = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_tags",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("user_tags")
    @Fetch(FetchMode.SUBSELECT)
    private List<Tag> tags = new ArrayList<>();

    // region transient
    @JsonProperty("user_gravatar")
    public String getGravatar() {
        String emailMd5 = CryptoHelper.md5Hex(getEmail().trim().toLowerCase());
        return "https://www.gravatar.com/avatar/" + emailMd5 + "?d=mm";
    }

    @JsonProperty("user_invited")
    public boolean isInvited() {
        return !isAdmin() && getGroups().stream()
                .mapToLong(group -> group.getGrants().size()).sum() == 0;
    }

    @JsonProperty("user_can_invite")
    public boolean canInvite() {
        return isAdmin() || getGroups().stream()
                .flatMap(group -> group.getGrants().stream())
                .anyMatch(grant -> grant.getName().equals(PLANNER.name()));
    }
    // endregion

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
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

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Group> getGroups() {
        return groups;
    }

    public void setGroups(List<Group> groups) {
        this.groups = groups;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Token> getTokens() {
        return tokens;
    }

    public void setTokens(List<Token> tokens) {
        this.tokens = tokens;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Short getStatus() {
        return status;
    }

    public void setStatus(Short status) {
        this.status = status;
    }

    public List<Audience> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<Audience> audiences) {
        this.audiences = audiences;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    @JsonIgnore
    public Map<String, Object> getAttributes() {
        HashMap<String, Object> attributes = new HashMap<>();
        attributes.put("id", getId());
        attributes.put("name", getName());
        attributes.put("email", getEmail());
        return attributes;
    }

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> roles = new ArrayList<>();
        roles.add(new SimpleGrantedAuthority(ROLE_USER));
        if (isAdmin()) {
            roles.add(new SimpleGrantedAuthority(ROLE_ADMIN));
        }
        return roles;
    }

    @Override
    @JsonIgnore
    public String getName() {
        return getFirstname() + " " + getLastname();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id.equals(user.id);
    }
}
