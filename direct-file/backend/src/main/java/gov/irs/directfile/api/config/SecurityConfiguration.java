package gov.irs.directfile.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import gov.irs.directfile.api.authentication.*;
import gov.irs.directfile.api.cache.CacheService;

@Configuration
@Profile(BeanProfiles.DEFAULT_SECURITY)
@EnableConfigurationProperties({UserDetailsCacheProperties.class})
@Slf4j
public class SecurityConfiguration {

    @Bean
    @Profile(BeanProfiles.FAKE_PII_SERVICE)
    public PIIService fakePiiService() {
        return new FakePIIService();
    }

    @Bean
    @Profile("!" + BeanProfiles.ENABLE_REMOTE_CACHE)
    public UserDetailsCacheService localUserDetailsCacheService(UserDetailsCacheProperties userDetailsCacheProperties) {
        return new LocalUserDetailsCacheService(userDetailsCacheProperties);
    }

    @Bean
    @Profile(BeanProfiles.ENABLE_REMOTE_CACHE) // use remote cache for local development
    public UserDetailsCacheService remoteUserDetailsCacheService(
            CacheService cacheService, UserDetailsCacheProperties userDetailsCacheProperties) {
        return new RemoteUserDetailsCacheService(cacheService, userDetailsCacheProperties);
    }

    @Bean
    @Order(1)
    public SecurityFilterChain fc(HttpSecurity http) {
        // This chain handles all paths that **do not** require authentication

        log.info("Adding SecurityFilterChain: anonymousFilterChain");
        try {
            http.cors(Customizer.withDefaults())
                    .securityMatchers(securityMatchers -> securityMatchers.requestMatchers("/**"))
                    .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll())
                    .sessionManagement(
                            sessionMgmt -> sessionMgmt.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .httpBasic(AbstractHttpConfigurer::disable)
                    .formLogin(AbstractHttpConfigurer::disable)
                    .logout(AbstractHttpConfigurer::disable);

            return http.build();
        } catch (Exception e) {
            log.error("Anonymous HttpSecurity filter fails: {}", e.getMessage());
            throw new RuntimeException("Anonymous HttpSecurity filter fails: " + e.getMessage(), e);
        }
    }
}
