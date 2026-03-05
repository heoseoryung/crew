package com.example.noticeboard.security.config;

import com.example.noticeboard.oauth.service.CustomOAuth2UserService;
import com.example.noticeboard.oauth.support.CustomAuthenticationFailureHandler;
import com.example.noticeboard.oauth.support.OAuth2AuthenticationSuccessHandler;
import com.example.noticeboard.security.jwt.support.JwtAuthenticationFilter;
import com.example.noticeboard.account.user.constant.UserRole;
import com.example.noticeboard.admin.visitant.util.SingleVisitInterceptor;
import com.example.noticeboard.common.exception.FilterExceptionHandler;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter authenticationFilter;
    private final CustomOAuth2UserService oauth2UserService;
    private final SingleVisitInterceptor singleVisitInterceptor;
    private final OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler;
    private final CustomAuthenticationFailureHandler customAuthenticationFailureHandler;

    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println("========== OAuth 설정 디버깅 ==========");
        
        /* 기존 코드 주석 처리: System.out.println("DEBUG GOOGLE ID: " + System.getenv("GOOGLE_CLIENT_ID")); */
        // .env에서 System.setProperty로 저장했으니 getProperty로 불러와야 해!
        System.out.println("DEBUG GOOGLE ID: " + System.getProperty("GOOGLE_CLIENT_ID"));
        System.out.println("DEBUG GOOGLE SECRET: " + System.getProperty("GOOGLE_CLIENT_SECRET"));
        
        System.out.println("=====================================");
    }

    @Bean
    public BCryptPasswordEncoder encodePassword() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    	http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.csrf().disable()
                .httpBasic().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests()
                .requestMatchers(HttpMethod.GET, "/admin/**").hasRole(UserRole.MANAGER.name())
                .requestMatchers(HttpMethod.GET, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/admin/report/**" , "/admin/login", "/mail/**", "/admin/login", "/logins", "/registers", "/oauth/token", "/user/logout").permitAll()
                .requestMatchers( "/admin/**").hasRole(UserRole.MANAGER.name())
                .requestMatchers(HttpMethod.POST, "/**").hasAnyRole(UserRole.USER.name(), UserRole.MANAGER.name())
                .requestMatchers(HttpMethod.PATCH, "/posts/views/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/**").hasAnyRole(UserRole.USER.name(), UserRole.MANAGER.name())
                .requestMatchers(HttpMethod.PATCH, "/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/**").hasAnyRole(UserRole.USER.name(), UserRole.MANAGER.name())
                .and()
                .oauth2Login().loginPage("/authorization/denied")
                .successHandler(oauth2AuthenticationSuccessHandler)
                .failureHandler(customAuthenticationFailureHandler)
                .userInfoEndpoint().userService(oauth2UserService);

        http.addFilterBefore(new FilterExceptionHandler(),
                UsernamePasswordAuthenticationFilter.class);

        http.addFilterBefore(singleVisitInterceptor,
                UsernamePasswordAuthenticationFilter.class
        );

        http.addFilterBefore(authenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); 
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")); // PATCH도 추가 권장
        config.setAllowedHeaders(List.of("*")); // 모든 헤더 허용 추가 [cite: 2026-02-15]
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}