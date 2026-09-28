package sk.beton.vexle.core.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AppUserRegistrationDto {

    private String username;
    private String email;
    private String phone;
    private String password;

}