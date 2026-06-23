package utfpr.com.Proj_Paradigmas.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleBooksSearchResponseDto(Integer totalItems, List<GoogleBookVolumeDto> items) {}
