package sk.beton.vexle.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Flag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> tags; // REAL, FICTIONAL, GAME, COUNTRY, CITY, PROVINCE, EMBLEM, EUROPE, ASIA, ...

    private String name;

    private String country;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String svg;

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(nullable = false)
    private List<String> colors;

    @Column(nullable = false)
    private int colorCount;

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(nullable = false)
    private List<String> desaturatedColors;
}