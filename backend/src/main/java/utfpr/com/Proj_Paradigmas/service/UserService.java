package utfpr.com.Proj_Paradigmas.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
import utfpr.com.Proj_Paradigmas.dto.ReviewResponse;
import utfpr.com.Proj_Paradigmas.dto.UserProfileResponse;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.BookListRepository;
import utfpr.com.Proj_Paradigmas.repository.ReviewRepository;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BookListRepository bookListRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Buscar listas públicas apenas
        List<BookListResponse> publicLists = bookListRepository.findByUserUsernameAndIsPrivateFalse(username)
                .stream()
                .map(list -> new BookListResponse(
                        list.getId(),
                        list.getName(),
                        list.getBooks().stream().map(b -> new utfpr.com.Proj_Paradigmas.dto.BookSummaryResponse(
                                b.getId(),
                                b.getGoogleBooksId(),
                                b.getTitle(),
                                b.getCoverUrl()
                        )).toList(),
                        list.isPrivate()
                ))
                .toList();

        // Buscar avaliações feitas por este usuário
        List<ReviewResponse> reviews = reviewRepository.findByUserUsername(username)
                .stream()
                .map(review -> new ReviewResponse(
                        review.getId(),
                        review.getUser().getUsername(),
                        review.getBook().getGoogleBooksId(),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()
                ))
                .toList();

        return new UserProfileResponse(user.getUsername(), publicLists, reviews);
    }
}
