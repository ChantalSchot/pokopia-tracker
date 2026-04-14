package com.pokopia.tracker.importer;

import org.springframework.stereotype.Component;

import java.text.Normalizer;

@Component
public class ImportNormalizer {

    public String normalize(String input) {
        if (input == null) return "";
        String nfkd = Normalizer.normalize(input, Normalizer.Form.NFKD);
        String ascii = nfkd.replaceAll("[^\\p{ASCII}]", "");
        return ascii.toLowerCase().trim();
    }

    public boolean matches(String a, String b) {
        return normalize(a).equals(normalize(b));
    }
}
