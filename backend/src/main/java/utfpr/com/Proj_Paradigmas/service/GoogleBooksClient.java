package utfpr.com.Proj_Paradigmas.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import utfpr.com.Proj_Paradigmas.dto.GoogleBookVolumeDto;
import utfpr.com.Proj_Paradigmas.dto.GoogleBooksSearchResponseDto;

@Component
@RequiredArgsConstructor
public class GoogleBooksClient {

    private final RestClient googleBooksRestClient;

    @Value("${google.books.api.key:}")
    private String apiKey;

    public List<GoogleBookVolumeDto> search(String query) {
        GoogleBooksSearchResponseDto response =
                googleBooksRestClient
                        .get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/volumes")
                                    .queryParam("q", query)
                                    .queryParam("maxResults", 40);
                            if (apiKey != null && !apiKey.isBlank()) {
                                builder.queryParam("key", apiKey);
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .body(GoogleBooksSearchResponseDto.class);

        if (response == null || response.items() == null) {
            return List.of();
        }
        return response.items();
    }

    public Optional<GoogleBookVolumeDto> findById(String googleBooksId) {
        try {
            GoogleBookVolumeDto dto =
                    googleBooksRestClient
                            .get()
                            .uri(uriBuilder -> {
                                var builder = uriBuilder.path("/volumes/{id}");
                                if (apiKey != null && !apiKey.isBlank()) {
                                    builder.queryParam("key", apiKey);
                                }
                                return builder.build(googleBooksId);
                            })
                            .retrieve()
                            .body(GoogleBookVolumeDto.class);
            return Optional.ofNullable(dto);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        }
    }
}
