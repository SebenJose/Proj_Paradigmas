package utfpr.com.Proj_Paradigmas.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import utfpr.com.Proj_Paradigmas.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByGoogleBooksId(String googleBooksId);
}
