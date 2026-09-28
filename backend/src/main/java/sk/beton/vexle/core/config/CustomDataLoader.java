package sk.beton.vexle.core.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sk.beton.vexle.core.config.countries.ResourceFlagSeeder;
import sk.beton.vexle.core.entity.AppUser;
import sk.beton.vexle.core.repository.AppUserRepository;
import sk.beton.vexle.core.repository.FlagRepository;

import java.util.List;

@Component
public class CustomDataLoader implements ApplicationRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final FlagRepository flagRepository;
    private final ResourceFlagSeeder resourceFlagSeeder;

    public CustomDataLoader(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            FlagRepository flagRepository,
            ResourceFlagSeeder resourceFlagSeeder
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.flagRepository = flagRepository;
        this.resourceFlagSeeder = resourceFlagSeeder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (appUserRepository.count() == 0) {
            seedCustomers();
        }
        if (flagRepository.count() == 0) {
            resourceFlagSeeder.seedAllFlags();
        }
    }

    private void seedCustomers() {
        List<String> emails = List.of(
                "user1@example.com",
                "user2@example.com",
                "user3@example.com"
        );

        for (int i = 0; i < emails.size(); i++) {
            AppUser u = new AppUser();
            u.setEmail(emails.get(i));
            u.setUsername("user" + (i + 1));
            u.setPassword(passwordEncoder.encode("password"));
            u.setPhone("+4219000000" + (i + 1));
            u.setRole("ROLE_USER");
            appUserRepository.save(u);
        }

        appUserRepository.save(AppUser.builder()
                .username("admin")
                .password(passwordEncoder.encode("password"))
                .email("admin@me.com")
                .phone("+421000000007")
                .role("ROLE_ADMIN")
                .build());
    }
}