package utfpr.com.Proj_Paradigmas.repository;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import utfpr.com.Proj_Paradigmas.dto.BookRatingSummary;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.model.Review;
import utfpr.com.Proj_Paradigmas.model.User;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBookGoogleBooksId(String googleBooksId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"book", "user"})
    List<Review> findByUserUsername(String username);

    boolean existsByUserAndBook(User user, Book book);

    boolean existsByUserUsernameAndBookGoogleBooksId(String username, String googleBooksId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.googleBooksId = :googleBooksId")
    Double getAverageRatingByGoogleBooksId(@Param("googleBooksId") String googleBooksId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.book.googleBooksId = :googleBooksId")
    Long getReviewCountByGoogleBooksId(@Param("googleBooksId") String googleBooksId);

    @Query("SELECT new utfpr.com.Proj_Paradigmas.dto.BookRatingSummary(" +
           "r.book.googleBooksId, r.book.title, r.book.coverUrl, AVG(r.rating), COUNT(r)) " +
           "FROM Review r " +
           "GROUP BY r.book.googleBooksId, r.book.title, r.book.coverUrl " +
           "ORDER BY AVG(r.rating) DESC")
    List<BookRatingSummary> findTopRatedBooks(Pageable pageable);

    @Query("SELECT new utfpr.com.Proj_Paradigmas.dto.BookRatingSummary(" +
           "r.book.googleBooksId, r.book.title, r.book.coverUrl, AVG(r.rating), COUNT(r)) " +
           "FROM Review r " +
           "GROUP BY r.book.googleBooksId, r.book.title, r.book.coverUrl " +
           "ORDER BY COUNT(r) DESC")
    List<BookRatingSummary> findMostReviewedBooks(Pageable pageable);

    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews(Pageable pageable);
}
