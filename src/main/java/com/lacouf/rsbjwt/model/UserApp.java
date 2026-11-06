package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class UserApp  {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String firstName;
    private String lastName;

    @Embedded
    private Credentials credentials;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Notification> notifications = new ArrayList<>();

    protected UserApp() {
    }

    protected UserApp(String firstName, String lastName, Credentials credentials) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.credentials = credentials;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return this.firstName; }

    public String getLastName() { return this.lastName; }

    public String getEmail(){
        return credentials.getUsername();
    }

    public boolean aPourCourriel(String courriel) {
        String email = getEmail();
        return email != null && email.equalsIgnoreCase(courriel);
    }

    public String getPassword(){
        return credentials.getPassword();
    }

    public Role getRole(){
        return credentials.getRole();
    }

    public Collection<? extends GrantedAuthority> getAuthorities(){
        return credentials.getAuthorities();
    }

    public List<Notification> getNotifications() {
        return Collections.unmodifiableList(notifications);
    }

    public void addNotification(Notification notification) {
        notifications.add(notification);
        notification.setOwner(this);
    }
}