package utfpr.com.Proj_Paradigmas.dto;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        String username,
        String googleBooksId,
        Double rating,
        String comment,
        Instant createdAt
) {}
