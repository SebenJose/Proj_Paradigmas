package utfpr.com.Proj_Paradigmas.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import utfpr.com.Proj_Paradigmas.dto.BookDetailResponse;
import utfpr.com.Proj_Paradigmas.dto.BookSearchResultDto;
import utfpr.com.Proj_Paradigmas.service.BookService;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping("/search")
    public ResponseEntity<List<BookSearchResultDto>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(bookService.search(query));
    }

    @GetMapping("/{googleBooksId}")
    public ResponseEntity<BookDetailResponse> getByGoogleBooksId(@PathVariable String googleBooksId) {
        return ResponseEntity.ok(bookService.getDetail(googleBooksId));
    }
}
