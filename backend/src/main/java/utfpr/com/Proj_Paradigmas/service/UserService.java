package utfpr.com.Proj_Paradigmas.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
import utfpr.com.Proj_Paradigmas.dto.ReviewResponse;
import utfpr.com.Proj_Paradigmas.dto.UserProfileResponse;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.User;
import utfpr.com.Proj_Paradigmas.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BookListService bookListService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        List<BookListResponse> publicLists = bookListService.getUserPublicLists(username);
        List<ReviewResponse> reviews = reviewService.getUserReviews(username);

        return new UserProfileResponse(user.getUsername(), publicLists, reviews);
    }
}
