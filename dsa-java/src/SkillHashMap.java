package src;

import java.util.HashMap;
import java.util.Map;

/**
 * SkillHashMap — Implements fast skill details search/lookup.
 * 
 * Choice of Data Structure: HashMap (Key: Skill Name, Value: Details Object)
 * Why chosen:
 *  - Offers O(1) average time complexity for lookups, insertions, and deletions.
 *  - Critical for high-volume platform searches where quick metadata check is needed.
 */
public class SkillHashMap {
    public static class SkillDetails {
        public String name;
        public String category;
        public int priorityScore;
        public int estimatedHours;

        public SkillDetails(String name, String category, int priorityScore, int estimatedHours) {
            this.name = name;
            this.category = category;
            this.priorityScore = priorityScore;
            this.estimatedHours = estimatedHours;
        }

        @Override
        public String toString() {
            return String.format("[%s] Category: %s | Priority: %d | Hours: %d", name, category, priorityScore, estimatedHours);
        }
    }

    private final Map<String, SkillDetails> registry;

    public SkillHashMap() {
        this.registry = new HashMap<>();
    }

    /**
     * Add skill details to the lookup register.
     * Time Complexity: O(1) average
     */
    public void registerSkill(String name, String category, int priorityScore, int estimatedHours) {
        registry.put(name.toLowerCase(), new SkillDetails(name, category, priorityScore, estimatedHours));
    }

    /**
     * Search and retrieve skill details.
     * Time Complexity: O(1) average
     */
    public SkillDetails lookup(String name) {
        return registry.get(name.toLowerCase());
    }

    /**
     * Remove skill details from register.
     * Time Complexity: O(1) average
     */
    public boolean delete(String name) {
        return registry.remove(name.toLowerCase()) != null;
    }
}
