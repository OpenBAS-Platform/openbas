package io.openex.rest.inject.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public class InjectNext {

    @JsonProperty("inject_title")
    private String title;

    @JsonProperty("inject_description")
    private String description;

    @JsonProperty("inject_type")
    private String type;

    @JsonProperty("inject_date")
    private Date date;

    public InjectNext(String title, String description, String type, Date date) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
