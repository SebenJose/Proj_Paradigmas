package utfpr.com.Proj_Paradigmas.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utfpr.com.Proj_Paradigmas.dto.BookDetailResponse;
import utfpr.com.Proj_Paradigmas.dto.BookSearchResultDto;
import utfpr.com.Proj_Paradigmas.dto.GoogleBookVolumeDto;
import utfpr.com.Proj_Paradigmas.exception.ResourceNotFoundException;
import utfpr.com.Proj_Paradigmas.model.Book;
import utfpr.com.Proj_Paradigmas.repository.BookRepository;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final GoogleBooksClient googleBooksClient;

    public List<BookSearchResultDto> search(String query) {
        return googleBooksClient.search(query).stream().map(this::toSearchResult).toList();
    }

    @Transactional
    public BookDetailResponse getDetail(String googleBooksId) {
        return toDetailResponse(findOrCreate(googleBooksId));
    }

    @Transactional
    public Book findOrCreate(String googleBooksId) {
        return bookRepository
                .findByGoogleBooksId(googleBooksId)
                .orElseGet(
                        () -> {
                            GoogleBookVolumeDto dto =
                                    googleBooksClient
                                            .findById(googleBooksId)
                                            .orElseThrow(
                                                    () ->
                                                            new ResourceNotFoundException(
                                                                    "Livro não encontrado"));
                            return bookRepository.save(toEntity(dto));
                        });
    }

    private BookSearchResultDto toSearchResult(GoogleBookVolumeDto dto) {
        GoogleBookVolumeDto.VolumeInfo info = dto.volumeInfo();
        return new BookSearchResultDto(
                dto.id(),
                info.title(),
                info.authors() != null ? info.authors() : List.of(),
                info.imageLinks() != null ? info.imageLinks().thumbnail() : null,
                info.publishedDate());
    }

    private BookDetailResponse toDetailResponse(Book book) {
        return new BookDetailResponse(
                book.getGoogleBooksId(),
                book.getTitle(),
                book.getAuthors(),
                book.getDescription(),
                book.getCoverUrl(),
                book.getPublishedDate(),
                book.getPageCount());
    }

    private Book toEntity(GoogleBookVolumeDto dto) {
        GoogleBookVolumeDto.VolumeInfo info = dto.volumeInfo();
        return Book.builder()
                .googleBooksId(dto.id())
                .title(info.title())
                .authors(info.authors() != null ? info.authors() : List.of())
                .description(info.description())
                .coverUrl(info.imageLinks() != null ? info.imageLinks().thumbnail() : null)
                .publishedDate(info.publishedDate())
                .pageCount(info.pageCount())
                .build();
    }
}
