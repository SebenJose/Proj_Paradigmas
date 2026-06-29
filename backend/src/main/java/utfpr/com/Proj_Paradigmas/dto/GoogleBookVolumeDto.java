package utfpr.com.Proj_Paradigmas.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleBookVolumeDto(String id, VolumeInfo volumeInfo, AccessInfo accessInfo) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VolumeInfo(
            String title,
            List<String> authors,
            String description,
            String publishedDate,
            Integer pageCount,
            ImageLinks imageLinks) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ImageLinks(String thumbnail) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AccessInfo(Boolean embeddable) {}
}
