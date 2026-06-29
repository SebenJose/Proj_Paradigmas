package utfpr.com.Proj_Paradigmas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import utfpr.com.Proj_Paradigmas.dto.NytBestsellersResponseDto;

public class NytClientTest {

    private RestClient restClient;
    private MockRestServiceServer mockServer;
    private NytClient nytClient;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://api.nytimes.com/svc/books/v3");
        mockServer = MockRestServiceServer.bindTo(builder).build();
        restClient = builder.build();
        nytClient = new NytClient(restClient);
    }

    @Test
    void testGetHardcoverFictionBestsellers_Success() {
        ReflectionTestUtils.setField(nytClient, "apiKey", "test-key");

        String jsonResponse = """
            {
                "status": "OK",
                "results": {
                    "books": [
                        {
                            "title": "Title One",
                            "author": "Author One",
                            "description": "Description One",
                            "primary_isbn13": "1234567890123"
                        }
                    ]
                }
            }
            """;

        mockServer.expect(requestTo("https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=test-key"))
                .andRespond(withSuccess(jsonResponse, MediaType.APPLICATION_JSON));

        List<NytBestsellersResponseDto.NytBookDto> books = nytClient.getHardcoverFictionBestsellers();

        mockServer.verify();
        assertNotNull(books);
        assertEquals(1, books.size());
        assertEquals("Title One", books.get(0).title());
        assertEquals("Author One", books.get(0).author());
        assertEquals("Description One", books.get(0).description());
        assertEquals("1234567890123", books.get(0).isbn13());
    }

    @Test
    void testGetHardcoverFictionBestsellers_NoApiKey() {
        ReflectionTestUtils.setField(nytClient, "apiKey", null);
        List<NytBestsellersResponseDto.NytBookDto> result = nytClient.getHardcoverFictionBestsellers();
        assertTrue(result.isEmpty());

        ReflectionTestUtils.setField(nytClient, "apiKey", "");
        result = nytClient.getHardcoverFictionBestsellers();
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetHardcoverFictionBestsellers_Exception() {
        ReflectionTestUtils.setField(nytClient, "apiKey", "test-key");

        mockServer.expect(requestTo("https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=test-key"))
                .andRespond(withServerError());

        List<NytBestsellersResponseDto.NytBookDto> result = nytClient.getHardcoverFictionBestsellers();

        mockServer.verify();
        assertTrue(result.isEmpty());
    }
}
