package sk.beton.vexle.core.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FlagThinDto {

    private Long id;
    private List<String> tags;
    private String svg;
    private List<String> desaturatedColors;
    private String name;
    private String country;
}