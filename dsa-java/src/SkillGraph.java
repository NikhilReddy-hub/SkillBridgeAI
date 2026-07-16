package src;

import java.util.*;

/**
 * SkillGraph — Represents skill dependencies as a Directed Acyclic Graph (DAG).
 * 
 * Choice of Data Structure: Adjacency List (Map<String, List<String>>)
 * Why chosen:
 *  - High efficiency for sparse graphs (skills typically have few dependencies).
 *  - BFS/DFS traversal is direct and fast.
 */
public class SkillGraph {
    private final Map<String, List<String>> adjList;

    public SkillGraph() {
        this.adjList = new HashMap<>();
    }

    /**
     * Add a skill node to the graph.
     */
    public void addSkill(String skill) {
        adjList.putIfAbsent(skill, new ArrayList<>());
    }

    /**
     * Add a dependency link between skills.
     * E.g., JavaScript depends on HTML (or React depends on JavaScript)
     * Here, direction is: skill -> dependency
     */
    public void addDependency(String skill, String dependency) {
        addSkill(skill);
        addSkill(dependency);
        adjList.get(skill).add(dependency);
    }

    /**
     * DFS (Depth-First Search) Pathway Generation.
     * Finds deep nested prerequisites pathway.
     * 
     * Time Complexity: O(V + E) where V is the number of skills (vertices) and E is dependencies (edges).
     * Space Complexity: O(V) for visited set and recursion call stack.
     */
    public List<String> getDFSPath(String startSkill) {
        List<String> path = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        dfsHelper(startSkill, visited, path);
        return path;
    }

    private void dfsHelper(String skill, Set<String> visited, List<String> path) {
        if (visited.contains(skill)) return;
        visited.add(skill);
        path.add(skill);
        for (String prereq : adjList.getOrDefault(skill, Collections.emptyList())) {
            dfsHelper(prereq, visited, path);
        }
    }

    /**
     * BFS (Breadth-First Search) Pathway Generation.
     * Finds level-by-level dependencies (immediate prerequisites first).
     * 
     * Time Complexity: O(V + E)
     * Space Complexity: O(V)
     */
    public List<String> getBFSPath(String startSkill) {
        List<String> path = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();

        queue.add(startSkill);
        visited.add(startSkill);

        while (!queue.isEmpty()) {
            String skill = queue.poll();
            path.add(skill);

            for (String prereq : adjList.getOrDefault(skill, Collections.emptyList())) {
                if (!visited.contains(prereq)) {
                    visited.add(prereq);
                    queue.add(prereq);
                }
            }
        }
        return path;
    }

    public Map<String, List<String>> getAdjList() {
        return adjList;
    }
}
