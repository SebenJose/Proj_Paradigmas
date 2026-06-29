package utfpr.com.Proj_Paradigmas.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import utfpr.com.Proj_Paradigmas.model.BookList;
import utfpr.com.Proj_Paradigmas.model.User;

public interface BookListRepository extends JpaRepository<BookList, Long> {

    List<BookList> findByUserUsername(String username);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"books"})
    List<BookList> findByUserUsernameAndIsPrivateFalse(String username);

    boolean existsByUserAndName(User user, String name);

    boolean existsByUserUsernameAndName(String username, String name);
}
