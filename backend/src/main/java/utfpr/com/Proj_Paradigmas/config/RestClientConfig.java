package utfpr.com.Proj_Paradigmas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient googleBooksRestClient() {
        return RestClient.builder().baseUrl("https://www.googleapis.com/books/v1").build();
    }

    @Bean
    public RestClient nytRestClient() {
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = 
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3000);
        requestFactory.setReadTimeout(5000);
        return RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl("https://api.nytimes.com/svc/books/v3")
                .build();
    }
}


