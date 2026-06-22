package utfpr.com.Proj_Paradigmas.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import utfpr.com.Proj_Paradigmas.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
