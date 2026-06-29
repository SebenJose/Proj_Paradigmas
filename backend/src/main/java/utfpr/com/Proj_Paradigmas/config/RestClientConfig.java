package utfpr.com.Proj_Paradigmas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient googleBooksRestClient() {
        return RestClient.builder()
                .requestFactory(createRequestFactory(3000, 5000))
                .baseUrl("https://www.googleapis.com/books/v1")
                .build();
    }

    @Bean
    public RestClient nytRestClient() {
        return RestClient.builder()
                .requestFactory(createRequestFactory(3000, 5000))
                .baseUrl("https://api.nytimes.com/svc/books/v3")
                .build();
    }

    private SimpleClientHttpRequestFactory createRequestFactory(int connectTimeout, int readTimeout) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);
        return requestFactory;
    }
}


