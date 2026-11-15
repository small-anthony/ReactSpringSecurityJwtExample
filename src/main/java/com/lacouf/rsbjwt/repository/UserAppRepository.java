package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.auth.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAppRepository extends JpaRepository<UserApp, Long> {

    @Query("""
        select u from UserApp u where trim(lower(u.credentials.email)) = :email
    """)
    Optional<UserApp> findUserAppByEmail(@Param("email") String email);

    @Query("""
        select u from UserApp u where u.credentials.role = :role
    """)
    List<UserApp> findByRole(@Param("role") Role role);

}
