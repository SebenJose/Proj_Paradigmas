package utfpr.com.Proj_Paradigmas.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utfpr.com.Proj_Paradigmas.dto.AddBookToListRequest;
import utfpr.com.Proj_Paradigmas.dto.BookListRequest;
import utfpr.com.Proj_Paradigmas.dto.BookListResponse;
import utfpr.com.Proj_Paradigmas.service.BookListService;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class BookListController {

    private final BookListService bookListService;

    @GetMapping("/me")
    public ResponseEntity<List<BookListResponse>> getUserLists(Authentication authentication) {
        return ResponseEntity.ok(bookListService.getUserLists(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<BookListResponse> createList(
            @Valid @RequestBody BookListRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookListService.createList(authentication.getName(), request));
    }

    @PostMapping("/{id}/books")
    public ResponseEntity<BookListResponse> addBookToList(
            @PathVariable("id") Long listId,
            @Valid @RequestBody AddBookToListRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(bookListService.addBookToList(authentication.getName(), listId, request));
    }

    @DeleteMapping("/{id}/books/{bookId}")
    public ResponseEntity<BookListResponse> removeBookFromList(
            @PathVariable("id") Long listId,
            @PathVariable("bookId") Long bookId,
            Authentication authentication) {
        return ResponseEntity.ok(bookListService.removeBookFromList(authentication.getName(), listId, bookId));
    }
}
