package com.pokopia.tracker.importer;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class ImportNormalizerTest {

    private final ImportNormalizer normalizer = new ImportNormalizer();

    @Test
    void normalize_removesAccents() {
        assertThat(normalizer.normalize("Poke Ball light")).isEqualTo("poke ball light");
    }

    @Test
    void normalize_lowercasesAndTrims() {
        assertThat(normalizer.normalize("  Hello World  ")).isEqualTo("hello world");
    }

    @Test
    void normalize_handlesNull() {
        assertThat(normalizer.normalize(null)).isEmpty();
    }

    @Test
    void matches_accentInsensitive() {
        assertThat(normalizer.matches("Poke Ball light", "Poke Ball light")).isTrue();
    }

    @Test
    void matches_caseInsensitive() {
        assertThat(normalizer.matches("HELLO", "hello")).isTrue();
    }

    @Test
    void matches_differentStrings() {
        assertThat(normalizer.matches("Apple", "Orange")).isFalse();
    }
}
