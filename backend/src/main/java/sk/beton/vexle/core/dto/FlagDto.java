package sk.beton.vexle.core.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FlagDto {

    private Long id;
    private String name;
    private List<String> tags;
    private String country;
    private String svg;
    private List<String> desaturatedColors;
    private List<String> colors;
}