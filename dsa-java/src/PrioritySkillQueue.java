package src;

import java.util.PriorityQueue;

/**
 * PrioritySkillQueue — Recommends highest priority skills first.
 * 
 * Choice of Data Structure: PriorityQueue (Min-Heap / Max-Heap adaptation)
 * Why chosen:
 *  - Automatically maintains order of skills based on their priority score.
 *  - Fetching the top priority item is O(1).
 *  - Insertion is O(log N).
 */
public class PrioritySkillQueue {
    public static class PrioritizedSkill implements Comparable<PrioritizedSkill> {
        public String name;
        public int priorityScore; // 1 to 100, higher score = higher priority

        public PrioritizedSkill(String name, int priorityScore) {
            this.name = name;
            this.priorityScore = priorityScore;
        }

        /**
         * Natural ordering: sort by priorityScore descending (Max-Heap equivalent).
         */
        @Override
        public int compareTo(PrioritizedSkill other) {
            return Integer.compare(other.priorityScore, this.priorityScore);
        }

        @Override
        public String toString() {
            return String.format("%s (Priority: %d)", name, priorityScore);
        }
    }

    private final PriorityQueue<PrioritizedSkill> queue;

    public PrioritySkillQueue() {
        this.queue = new PriorityQueue<>();
    }

    /**
     * Add skill to queue.
     * Time Complexity: O(log N)
     */
    public void offer(String name, int priorityScore) {
        queue.offer(new PrioritizedSkill(name, priorityScore));
    }

    /**
     * Fetch and remove the highest priority skill.
     * Time Complexity: O(log N)
     */
    public PrioritizedSkill poll() {
        return queue.poll();
    }

    /**
     * Peek at the highest priority skill without removing it.
     * Time Complexity: O(1)
     */
    public PrioritizedSkill peek() {
        return queue.peek();
    }

    public boolean isEmpty() {
        return queue.isEmpty();
    }

    public int size() {
        return queue.size();
    }
}
