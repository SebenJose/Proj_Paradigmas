package utfpr.com.Proj_Paradigmas.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NytBestsellersResponseDto(String status, Results results) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Results(List<NytBookDto> books) {}
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record NytBookDto(
        String title,
        String author,
        String description,
        @JsonProperty("primary_isbn13") String isbn13
    ) {}
}
