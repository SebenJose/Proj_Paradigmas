package utfpr.com.Proj_Paradigmas.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import utfpr.com.Proj_Paradigmas.dto.NytBestsellersResponseDto;
import java.util.List;

@Slf4j
@Component
public class NytClient {
    private final RestClient nytRestClient;
    
    @Value("${nyt.api.key:}")
    private String apiKey;
    
    public NytClient(@Qualifier("nytRestClient") RestClient nytRestClient) {
        this.nytRestClient = nytRestClient;
    }
    
    public List<NytBestsellersResponseDto.NytBookDto> getHardcoverFictionBestsellers() {
        if (apiKey == null || apiKey.isBlank()) {
            return List.of();
        }
        try {
            NytBestsellersResponseDto response = nytRestClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/lists/current/hardcover-fiction.json")
                    .queryParam("api-key", apiKey)
                    .build())
                .retrieve()
                .body(NytBestsellersResponseDto.class);
            if (response == null || response.results() == null || response.results().books() == null) {
                return List.of();
            }
            return response.results().books();
        } catch (Exception e) {
            log.error("Failed to fetch hardcover fiction bestsellers from New York Times API", e);
            return List.of();
        }
    }
}
