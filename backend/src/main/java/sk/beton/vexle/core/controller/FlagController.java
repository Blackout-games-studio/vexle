package sk.beton.vexle.core.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.beton.vexle.core.dto.FlagCreateDto;
import sk.beton.vexle.core.dto.FlagDto;
import sk.beton.vexle.core.dto.FlagThinDto;
import sk.beton.vexle.core.service.FlagService;

import java.util.List;

@RestController
@RequestMapping("/api/flags")
@RequiredArgsConstructor
public class FlagController {

    private final FlagService flagService;

    @GetMapping("/daily")
    public ResponseEntity<FlagThinDto> getDailyFlag() {
        return ResponseEntity.ok(flagService.getDailyFlag());
    }

    @GetMapping("/random")
    public ResponseEntity<FlagThinDto> getRandomFlag(
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) Integer colorCount,
            @RequestParam(required = false) Integer minColorCount,
            @RequestParam(required = false) Integer maxColorCount
    ) {
        return ResponseEntity.ok(
                flagService.getRandomFlag(tags, colorCount, minColorCount, maxColorCount)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlagDto> getFullFlag(@PathVariable Long id) {
        return ResponseEntity.ok(flagService.getFullFlag(id));
    }

    @GetMapping
    public ResponseEntity<String> checkOK() {
        return ResponseEntity.ok("Hello World");
    }

    @PostMapping
    public ResponseEntity<FlagDto> createFlag(@RequestBody FlagCreateDto createDto) {
        FlagDto created = flagService.createFlag(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}