package com.hrmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. CSRF korumasını kapatıyoruz (REST API için gerekli)
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. Sayfa/Endpoint yetkilendirmeleri
            .authorizeHttpRequests(auth -> auth
                // Herkese açık alanlar (Swagger, Login endpoint vb. ekleyebilirsin)
                .requestMatchers("/api/public/**", "/api/employees/register","api/employees/login").permitAll()
                
                // Hassas HR işlemleri (Bordro, Maaş, Personel Ekleme)
                .requestMatchers("/api/payroll/**", "/api/employees/manage/**").hasAnyRole("ADMIN", "HR")

                
                
                // Diğer tüm istekler kimlik doğrulama gerektirir
                .anyRequest().authenticated()
            )
            
            // 3. Postman veya Tarayıcıdan basit kullanıcı adı/şifre ile giriş (Basic Auth)
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // Geliştirme aşamasında veritabanı ile uğraşmadan test yapmak için
    // Bellekte kullanıcılar oluşturuyoruz.
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails adminUser = User.builder()
                .username("admin")
                .password(passwordEncoder().encode("admin123")) // Şifre: admin123
                .roles("ADMIN", "HR")
                .build();

        UserDetails regularEmployee = User.builder()
                .username("numan")
                .password(passwordEncoder().encode("1234")) // Şifre: 1234
                .roles("EMPLOYEE")
                .build();

        return new InMemoryUserDetailsManager(adminUser, regularEmployee);
    }

    // Şifreleri güvenli bir şekilde hashlemek için gerekli
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}