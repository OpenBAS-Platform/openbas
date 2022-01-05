package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tags")
@EntityListeners(ModelBaseListener.class)
public class Tag implements Base {
    @Id
    @Column(name = "tag_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("tag_id")
    private String id;

    @Column(name = "tag_name")
    @JsonProperty("tag_name")
    private String name;

    @Column(name = "tag_color")
    @JsonProperty("tag_color")
    private String color;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "documents_tags",
            joinColumns = @JoinColumn(name = "tag_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("tags_documents")
    @Fetch(FetchMode.SUBSELECT)
    private List<Document> documents = new ArrayList<>();

    @JsonIgnore
    @Override
    public boolean isUserObserver(User user) {
        return true;
    }

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name.toLowerCase();
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color.toLowerCase();
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }
}
