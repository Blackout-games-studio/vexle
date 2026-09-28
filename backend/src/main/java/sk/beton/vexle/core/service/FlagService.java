package sk.beton.vexle.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.beton.vexle.core.dto.FlagCreateDto;
import sk.beton.vexle.core.dto.FlagDto;
import sk.beton.vexle.core.dto.FlagThinDto;
import sk.beton.vexle.core.entity.Flag;
import sk.beton.vexle.core.repository.FlagRepository;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlagService {

    private final FlagRepository flagRepository;

    @Transactional(readOnly = true)
    public FlagThinDto getDailyFlag() {
        List<Flag> allFlags = flagRepository.findAllOrderedById();
        if (allFlags.isEmpty()) {
            throw new RuntimeException("No flags available in database");
        }

        String today = LocalDate.now(ZoneOffset.UTC).toString();
        int hash = Math.abs(today.hashCode());
        int index = hash % allFlags.size();

        return mapToThinDto(allFlags.get(index));
    }

    @Transactional(readOnly = true)
    public FlagThinDto getRandomFlag(
            List<String> tags,
            Integer colorCount,
            Integer minColorCount,
            Integer maxColorCount
    ) {
        List<String> normalizedTags = (tags != null && !tags.isEmpty())
                ? tags.stream().map(String::toUpperCase).toList()
                : List.of();

        boolean hasTags = !normalizedTags.isEmpty();

        Flag flag = flagRepository.findRandomFlagWithFilters(
                        normalizedTags,
                        hasTags,
                        normalizedTags.size(),
                        colorCount,
                        minColorCount,
                        maxColorCount
                )
                .orElseThrow(() -> new RuntimeException("No flag found matching specified criteria"));

        return mapToThinDto(flag);
    }

    @Transactional(readOnly = true)
    public FlagDto getFullFlag(Long id) {
        Flag flag = flagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flag not found with id: " + id));
        return mapToFullDto(flag);
    }

    @Transactional
    public FlagDto createFlag(FlagCreateDto createDto) {
        Flag flag = new Flag();
        flag.setName(createDto.getName());
        flag.setCountry(createDto.getCountry());
        flag.setSvg(createDto.getSvg());
        flag.setColors(createDto.getColors());
        flag.setDesaturatedColors(createDto.getDesaturatedColors());

        if (createDto.getTags() != null) {
            List<String> normalizedTags = createDto.getTags().stream()
                    .map(String::toUpperCase)
                    .toList();
            flag.setTags(normalizedTags);
        }

        Flag savedFlag = flagRepository.save(flag);
        return mapToFullDto(savedFlag);
    }

    private FlagThinDto mapToThinDto(Flag flag) {
        FlagThinDto dto = new FlagThinDto();
        dto.setId(flag.getId());
        dto.setName(flag.getName());
        dto.setCountry(flag.getCountry());
        dto.setTags(flag.getTags());
        dto.setSvg(flag.getSvg());
        dto.setDesaturatedColors(flag.getDesaturatedColors());
        return dto;
    }

    private FlagDto mapToFullDto(Flag flag) {
        FlagDto dto = new FlagDto();
        dto.setId(flag.getId());
        dto.setName(flag.getName());
        dto.setTags(flag.getTags());
        dto.setCountry(flag.getCountry());
        dto.setSvg(flag.getSvg());
        dto.setDesaturatedColors(flag.getDesaturatedColors());
        dto.setColors(flag.getColors());
        return dto;
    }
}