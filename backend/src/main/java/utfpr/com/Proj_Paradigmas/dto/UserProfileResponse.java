package utfpr.com.Proj_Paradigmas.dto;

import java.util.List;

public record UserProfileResponse(
        String username,
        List<BookListResponse> lists,
        List<ReviewResponse> reviews
) {}
