package sk.beton.vexle.core.config.countries;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SvgProcessorService {

    private static final double SIMILARITY_THRESHOLD = 30.0;

    public static class ProcessedSvg {
        private final String svgContent;
        private final List<String> colors;
        private final List<String> desaturatedColors;

        public ProcessedSvg(String svgContent, List<String> colors, List<String> desaturatedColors) {
            this.svgContent = svgContent;
            this.colors = colors;
            this.desaturatedColors = desaturatedColors;
        }

        public String getSvgContent() { return svgContent; }
        public List<String> getColors() { return colors; }
        public List<String> getDesaturatedColors() { return desaturatedColors; }
    }

    public ProcessedSvg processSvg(String rawSvg, int maxRegions) {
        Document doc = Jsoup.parse(rawSvg, "", org.jsoup.parser.Parser.xmlParser());
        Element svgRoot = doc.selectFirst("svg");
        if (svgRoot == null) {
            return new ProcessedSvg(rawSvg, Collections.emptyList(), Collections.emptyList());
        }

        Map<String, String> cssRules = parseEmbeddedCss(doc);
        Elements drawableElements = doc.select("path, rect, circle, polygon, ellipse, line, polyline");

        // Extract raw color occurrences from all elements
        List<ColorOccurrence> rawOccurrences = new ArrayList<>();
        for (Element el : drawableElements) {
            extractElementColors(el, cssRules, rawOccurrences);
        }

        if (rawOccurrences.isEmpty()) {
            return new ProcessedSvg(rawSvg, Collections.emptyList(), Collections.emptyList());
        }

        // Cluster similar colors into unified base colors
        List<ColorCluster> clusters = clusterSimilarColors(rawOccurrences);

        // Sort clusters by area/frequency and cap at maxRegions
        clusters.sort((a, b) -> Long.compare(b.totalCount, a.totalCount));
        if (clusters.size() > maxRegions) {
            clusters = clusters.subList(0, maxRegions);
        }

        // Map original colors to their assigned region variable
        Map<String, String> colorToRegionVarMap = new HashMap<>();
        List<String> paletteHexes = new ArrayList<>();
        List<String> desaturatedHexes = new ArrayList<>();

        for (int i = 0; i < clusters.size(); i++) {
            ColorCluster cluster = clusters.get(i);
            String mainHex = cluster.canonicalHex;
            String varName = String.format("--region-%d", i + 1);

            paletteHexes.add(mainHex);
            desaturatedHexes.add(toDesaturatedHex(mainHex));

            for (String memberHex : cluster.memberHexes) {
                colorToRegionVarMap.put(memberHex, String.format("var(%s, %s)", varName, mainHex));
            }
        }

        // Apply variable styles to matching elements, leaving unmapped minor details intact
        for (Element el : drawableElements) {
            applyClusterStyles(el, cssRules, colorToRegionVarMap);
        }

        // Clean up conflicting style tags
        doc.select("style").remove();

        return new ProcessedSvg(doc.outerHtml(), paletteHexes, desaturatedHexes);
    }

    private static class ColorOccurrence {
        final Element element;
        final String property; // fill or stroke
        final String hex;

        ColorOccurrence(Element element, String property, String hex) {
            this.element = element;
            this.property = property;
            this.hex = hex;
        }
    }

    private static class ColorCluster {
        String canonicalHex;
        long totalCount = 0;
        Set<String> memberHexes = new HashSet<>();

        ColorCluster(String hex) {
            this.canonicalHex = hex;
            this.memberHexes.add(hex);
        }
    }

    private List<ColorCluster> clusterSimilarColors(List<ColorOccurrence> occurrences) {
        Map<String, Long> frequencyMap = new LinkedHashMap<>();
        for (ColorOccurrence occ : occurrences) {
            frequencyMap.put(occ.hex, frequencyMap.getOrDefault(occ.hex, 0L) + 1);
        }

        List<Map.Entry<String, Long>> sortedFrequencies = frequencyMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .collect(Collectors.toList());

        List<ColorCluster> clusters = new ArrayList<>();

        for (Map.Entry<String, Long> entry : sortedFrequencies) {
            String hex = entry.getKey();
            long count = entry.getValue();

            ColorCluster targetCluster = null;
            for (ColorCluster cluster : clusters) {
                if (colorDistance(hex, cluster.canonicalHex) < SIMILARITY_THRESHOLD) {
                    targetCluster = cluster;
                    break;
                }
            }

            if (targetCluster != null) {
                targetCluster.memberHexes.add(hex);
                targetCluster.totalCount += count;
            } else {
                ColorCluster newCluster = new ColorCluster(hex);
                newCluster.totalCount = count;
                clusters.add(newCluster);
            }
        }

        return clusters;
    }

    private void extractElementColors(Element el, Map<String, String> cssRules, List<ColorOccurrence> list) {
        if (isInsideNonRenderingNode(el)) return;

        String fill = resolveProperty(el, "fill", cssRules);
        if (fill != null) list.add(new ColorOccurrence(el, "fill", fill));

        String stroke = resolveProperty(el, "stroke", cssRules);
        if (stroke != null) list.add(new ColorOccurrence(el, "stroke", stroke));
    }

    private void applyClusterStyles(Element el, Map<String, String> cssRules, Map<String, String> colorToRegionVarMap) {
        if (isInsideNonRenderingNode(el)) return;

        String fill = resolveProperty(el, "fill", cssRules);
        String stroke = resolveProperty(el, "stroke", cssRules);

        Map<String, String> styleMap = parseStyleAttribute(el.attr("style"));

        if (fill != null && colorToRegionVarMap.containsKey(fill)) {
            styleMap.put("fill", colorToRegionVarMap.get(fill));
            el.removeAttr("fill");
        }

        if (stroke != null && colorToRegionVarMap.containsKey(stroke)) {
            styleMap.put("stroke", colorToRegionVarMap.get(stroke));
            el.removeAttr("stroke");
        }

        if (!styleMap.isEmpty()) {
            String inlineStyle = styleMap.entrySet().stream()
                    .map(e -> e.getKey() + ": " + e.getValue())
                    .collect(Collectors.joining("; "));
            el.attr("style", inlineStyle);
        }
    }

    private boolean isInsideNonRenderingNode(Element el) {
        Element curr = el;
        while (curr != null) {
            String tag = curr.tagName().toLowerCase();
            if (tag.equals("defs") || tag.equals("clippath") || tag.equals("mask") || tag.equals("pattern") || tag.contains("gradient")) {
                return true;
            }
            curr = curr.parent();
        }
        return false;
    }

    private String resolveProperty(Element el, String prop, Map<String, String> cssRules) {
        String styleAttr = el.attr("style");
        if (!styleAttr.isBlank()) {
            Map<String, String> styles = parseStyleAttribute(styleAttr);
            if (styles.containsKey(prop)) {
                String hex = parseToHex(styles.get(prop));
                if (hex != null) return hex;
            }
        }

        if (el.hasAttr(prop)) {
            String hex = parseToHex(el.attr(prop));
            if (hex != null) return hex;
        }

        if (el.hasAttr("class")) {
            for (String c : el.attr("class").trim().split("\\s+")) {
                String className = "." + c;
                if (cssRules.containsKey(className)) {
                    Map<String, String> styles = parseStyleAttribute(cssRules.get(className));
                    if (styles.containsKey(prop)) {
                        String hex = parseToHex(styles.get(prop));
                        if (hex != null) return hex;
                    }
                }
            }
        }

        Element parent = el.parent();
        if (parent != null && !parent.tagName().equalsIgnoreCase("svg") && !parent.tagName().equalsIgnoreCase("#root")) {
            return resolveProperty(parent, prop, cssRules);
        }

        return null;
    }

    private Map<String, String> parseStyleAttribute(String styleAttr) {
        Map<String, String> styles = new LinkedHashMap<>();
        if (styleAttr == null || styleAttr.isBlank()) return styles;

        for (String pair : styleAttr.split(";")) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                styles.put(kv[0].trim(), kv[1].trim());
            }
        }
        return styles;
    }

    private Map<String, String> parseEmbeddedCss(Document doc) {
        Map<String, String> cssRules = new HashMap<>();
        Elements styles = doc.select("style");
        Pattern pattern = Pattern.compile("([^\\{\\}]+)\\s*\\{\\s*([^\\}]+)\\s*\\}");

        for (Element style : styles) {
            Matcher matcher = pattern.matcher(style.html());
            while (matcher.find()) {
                String rawSelectors = matcher.group(1).trim();
                String rules = matcher.group(2).trim();

                for (String selector : rawSelectors.split(",")) {
                    cssRules.merge(selector.trim(), rules, (a, b) -> a + ";" + b);
                }
            }
        }
        return cssRules;
    }

    private String parseToHex(String input) {
        if (input == null || input.isBlank()) return null;
        String str = input.trim().toLowerCase();

        if (str.equals("none") || str.equals("transparent") || str.startsWith("url(")) {
            return null;
        }

        if (str.startsWith("#")) {
            String hex = str.substring(1);
            if (hex.length() == 3) {
                return String.format("#%c%c%c%c%c%c",
                        hex.charAt(0), hex.charAt(0),
                        hex.charAt(1), hex.charAt(1),
                        hex.charAt(2), hex.charAt(2));
            }
            if (hex.length() >= 6) {
                return "#" + hex.substring(0, 6);
            }
        }

        if (str.startsWith("rgb")) {
            Matcher matcher = Pattern.compile("rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)").matcher(str);
            if (matcher.find()) {
                return String.format("#%02x%02x%02x",
                        Integer.parseInt(matcher.group(1)),
                        Integer.parseInt(matcher.group(2)),
                        Integer.parseInt(matcher.group(3)));
            }
        }

        return null;
    }

    private double colorDistance(String hex1, String hex2) {
        Color c1 = Color.decode(hex1);
        Color c2 = Color.decode(hex2);
        return Math.sqrt(
                Math.pow(c1.getRed() - c2.getRed(), 2) +
                        Math.pow(c1.getGreen() - c2.getGreen(), 2) +
                        Math.pow(c1.getBlue() - c2.getBlue(), 2)
        );
    }

    private String toDesaturatedHex(String hex) {
        Color c = Color.decode(hex);
        int gray = (int) (0.2126 * c.getRed() + 0.7152 * c.getGreen() + 0.0722 * c.getBlue());
        return String.format("#%02x%02x%02x", gray, gray, gray);
    }
}