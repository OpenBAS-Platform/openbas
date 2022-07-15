package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.database.model.basic.BasicInject;
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
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static java.time.Instant.now;
import static java.util.stream.StreamSupport.stream;

@Entity
@Table(name = "users")
@EntityListeners(ModelBaseListener.class)
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

    @Column(name = "user_theme")
    @JsonProperty("user_theme")
    private String theme = "default";

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
    private Instant createdAt = now();

    @Column(name = "user_updated_at")
    @JsonProperty("user_updated_at")
    private Instant updatedAt = now();

    @ManyToOne
    @JoinColumn(name = "user_organization")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("user_organization")
    private Organization organization;

    @Column(name = "user_admin")
    @JsonProperty("user_admin")
    private boolean admin = false;

    @Column(name = "user_country")
    @JsonProperty("user_country")
    private String country;

    @Column(name = "user_city")
    @JsonProperty("user_city")
    private String city;

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
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "audience_id"))
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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "communications_users",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "communication_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("user_communications")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<Communication> communications = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Token> tokens = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    @JsonIgnore
    @Fetch(FetchMode.SUBSELECT)
    private List<ComcheckStatus> comcheckStatuses = new ArrayList<>();

    // region transient
    private transient List<BasicInject> injects = new ArrayList<>();

    public void resolveInjects(Iterable<BasicInject> injects) {
        this.injects = stream(injects.spliterator(), false)
                .filter(inject -> inject.isAllAudiences() || inject.getAudiences().stream()
                        .anyMatch(audience -> getAudiences().contains(audience)))
                .collect(Collectors.toList());
    }

    @JsonProperty("user_injects")
    @JsonSerialize(using = MultiModelDeserializer.class)
    public List<BasicInject> getUserInject() {
        return injects;
    }

    @JsonProperty("user_injects_number")
    public long getUserInjectsNumber() {
        return injects.size();
    }

    @JsonProperty("user_gravatar")
    public String getGravatar() {
        String emailMd5 = CryptoHelper.md5Hex(getEmail().trim().toLowerCase());
        return "https://www.gravatar.com/avatar/" + emailMd5 + "?d=mm";
    }

    @JsonProperty("user_is_planner")
    public boolean isPlanner() {
        return isAdmin() || getGroups().stream()
                .flatMap(group -> group.getGrants().stream())
                .anyMatch(grant -> Grant.GRANT_TYPE.PLANNER.equals(grant.getName()));
    }

    @JsonProperty("user_is_observer")
    public boolean isObserver() {
        return isAdmin() || getGroups().stream()
                .mapToLong(group -> group.getGrants().size()).sum() > 0;
    }

    @JsonProperty("user_is_manager")
    public boolean isManager() {
        return isPlanner() || isObserver();
    }

    @JsonProperty("user_last_comcheck")
    public Optional<Instant> getLastComcheck() {
        return getComcheckStatuses().stream()
                .filter(comcheckStatus -> comcheckStatus.getReceiveDate().isPresent())
                .map(comcheckStatus -> comcheckStatus.getReceiveDate().get())
                .min(Instant::compareTo);
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

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
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

    public List<ComcheckStatus> getComcheckStatuses() {
        return comcheckStatuses;
    }

    public void setComcheckStatuses(List<ComcheckStatus> comcheckStatuses) {
        this.comcheckStatuses = comcheckStatuses;
    }

    public List<Communication> getCommunications() {
        return communications;
    }

    public void setCommunications(List<Communication> communications) {
        this.communications = communications;
    }

    @JsonProperty("user_is_only_player")
    public boolean isOnlyPlayer() {
        return !isAdmin() && !isManager();
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin() || user.getId().equals(getId());
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
        if (o == null || !Base.class.isAssignableFrom(o.getClass())) return false;
        Base base = (Base) o;
        return id.equals(base.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return email;
    }
}
