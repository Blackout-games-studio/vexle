package sk.beton.vexle.core.config.countries;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import sk.beton.vexle.core.entity.Flag;
import sk.beton.vexle.core.repository.FlagRepository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class ResourceFlagSeeder {

    private final FlagRepository flagRepository;
    private final SvgProcessorService svgProcessorService;
    private final ObjectMapper objectMapper;

    private static final Map<String, Set<String>> CONTINENTS = Map.of(
            "EUROPE", Set.of("AD", "AL", "AM", "AT", "AX", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FO", "FR", "GB", "GB-ENG", "GB-NIR", "GB-SCT", "GB-WLS", "GE", "GI", "GR", "HR", "HU", "IE", "IM", "IS", "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL", "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SM", "UA", "VA", "XK"),
            "ASIA", Set.of("AE", "AF", "AZ", "BD", "BH", "BN", "BT", "CN", "ID", "IL", "IN", "IQ", "IR", "JO", "JP", "KG", "KH", "KP", "KR", "KW", "KZ", "LA", "LB", "LK", "MM", "MN", "MO", "MV", "MY", "NP", "OM", "PH", "PK", "PS", "QA", "SA", "SG", "SY", "TH", "TJ", "TL", "TM", "TR", "TW", "UZ", "VN", "YE"),
            "AFRICA", Set.of("AO", "BF", "BI", "BJ", "BW", "CD", "CF", "CG", "CI", "CM", "CV", "DJ", "DZ", "EG", "EH", "ER", "ET", "GA", "GH", "GM", "GN", "GQ", "GW", "KE", "KM", "LR", "LS", "LY", "MA", "MG", "ML", "MR", "MU", "MW", "MZ", "NA", "NE", "NG", "RW", "SC", "SD", "SL", "SN", "SO", "SS", "ST", "SZ", "TD", "TG", "TN", "TZ", "UG", "YT", "ZA", "ZM", "ZW"),
            "NORTH_AMERICA", Set.of("AG", "AI", "AW", "BB", "BL", "BM", "BS", "BZ", "CA", "CR", "CU", "CW", "DM", "DO", "GD", "GL", "GP", "GT", "HN", "HT", "JM", "KN", "KY", "LC", "MF", "MQ", "MS", "MX", "NI", "PA", "PM", "PR", "SV", "SX", "TC", "TT", "US", "VC", "VG", "VI"),
            "SOUTH_AMERICA", Set.of("AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY", "SR", "UY", "VE"),
            "OCEANIA", Set.of("AS", "AU", "CK", "FJ", "FM", "GU", "KI", "MH", "MP", "NC", "NF", "NR", "NU", "NZ", "PF", "PG", "PN", "PW", "SB", "TK", "TO", "TV", "VU", "WF", "WS"),
            "ANTARCTICA", Set.of("AQ", "BV", "GS", "HM", "TF")
    );

    public ResourceFlagSeeder(FlagRepository flagRepository, SvgProcessorService svgProcessorService, ObjectMapper objectMapper) {
        this.flagRepository = flagRepository;
        this.svgProcessorService = svgProcessorService;
        this.objectMapper = objectMapper;
    }

    public void seedAllFlags() {
        try {
            Map<String, String> countryNames = loadCountryNames();

            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:flags/svg/*.svg");

            List<Flag> batch = new ArrayList<>();

            for (Resource resource : resources) {
                String filename = resource.getFilename();
                if (filename == null) continue;

                String isoCode = filename.replace(".svg", "").toUpperCase();
                String countryName = countryNames.getOrDefault(isoCode, isoCode);

                String rawSvg;
                try (InputStream is = resource.getInputStream()) {
                    rawSvg = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                }

                SvgProcessorService.ProcessedSvg processed = svgProcessorService.processSvg(rawSvg, 5);

                Flag flag = new Flag();
                flag.setName(countryName);
                flag.setCountry(countryName);
                flag.setTags(determineTags(isoCode));
                flag.setColorCount(processed.getColors().size());
                flag.setSvg(processed.getSvgContent());
                flag.setColors(processed.getColors());
                flag.setDesaturatedColors(processed.getDesaturatedColors());

                batch.add(flag);

                if (batch.size() >= 20) {
                    flagRepository.saveAll(batch);
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) {
                flagRepository.saveAll(batch);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to seed flags from resources", e);
        }
    }

    private Map<String, String> loadCountryNames() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource resource = resolver.getResource("classpath:flags/countries.json");
            if (!resource.exists()) {
                return Collections.emptyMap();
            }
            try (InputStream is = resource.getInputStream()) {
                Map<String, String> rawMap = objectMapper.readValue(is, new TypeReference<Map<String, String>>() {});
                Map<String, String> normalizedMap = new HashMap<>();
                for (Map.Entry<String, String> entry : rawMap.entrySet()) {
                    normalizedMap.put(entry.getKey(), normalizeCountryName(entry.getValue()));
                }
                return normalizedMap;
            }
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private String normalizeCountryName(String name) {
        if (name == null || !name.contains(",")) {
            return name != null ? name.trim() : null;
        }
        int commaIndex = name.indexOf(',');
        String mainPart = name.substring(0, commaIndex).trim();
        String suffixPart = name.substring(commaIndex + 1).trim();
        return suffixPart + " " + mainPart;
    }

    private List<String> determineTags(String isoCode) {
        List<String> tags = new ArrayList<>();
        tags.add("REAL");

        if (isoCode.startsWith("GB-")) {
            tags.add("CONSTITUENT_COUNTRY");
        } else {
            tags.add("COUNTRY");
        }

        boolean foundContinent = false;
        for (Map.Entry<String, Set<String>> entry : CONTINENTS.entrySet()) {
            if (entry.getValue().contains(isoCode)) {
                tags.add(entry.getKey());
                foundContinent = true;
                break;
            }
        }

        if (!foundContinent) {
            tags.add("OTHER");
        }

        return tags;
    }
}