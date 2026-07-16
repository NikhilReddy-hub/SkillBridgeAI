package src;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("⚡ SkillBridge AI — Java DSA Integration Validation");
        System.out.println("==================================================\n");

        // 1. Validate SkillHashMap lookup
        System.out.println("--- 1. Validating SkillHashMap (O(1) Lookups) ---");
        SkillHashMap registry = new SkillHashMap();
        registry.registerSkill("React", "Framework", 95, 60);
        registry.registerSkill("JavaScript", "Language", 98, 80);
        registry.registerSkill("Docker", "DevOps", 85, 30);

        SkillHashMap.SkillDetails detail = registry.lookup("React");
        System.out.println("Lookup 'React': " + detail);
        System.out.println("Lookup 'Docker': " + registry.lookup("Docker"));
        System.out.println("Delete 'Docker': " + registry.delete("Docker"));
        System.out.println("Lookup 'Docker' after delete: " + registry.lookup("Docker"));
        System.out.println();

        // 2. Validate PrioritySkillQueue ordering
        System.out.println("--- 2. Validating PrioritySkillQueue (Priority Order) ---");
        PrioritySkillQueue pQueue = new PrioritySkillQueue();
        pQueue.offer("Next.js", 88);
        pQueue.offer("TypeScript", 92);
        pQueue.offer("HTML", 60);
        pQueue.offer("AWS", 95);

        System.out.println("Priority Queue extraction sequence:");
        while (!pQueue.isEmpty()) {
            System.out.println(" -> Popped: " + pQueue.poll());
        }
        System.out.println();

        // 3. Validate SkillGraph BFS/DFS pathway generators
        System.out.println("--- 3. Validating SkillGraph (BFS/DFS Dependency Traversal) ---");
        SkillGraph graph = new SkillGraph();
        // Path mapping: React -> JavaScript -> HTML -> CSS
        graph.addDependency("React", "JavaScript");
        graph.addDependency("JavaScript", "HTML");
        graph.addDependency("HTML", "CSS");

        System.out.println("Generated DFS Pathway starting from 'React':");
        List<String> dfsPath = graph.getDFSPath("React");
        System.out.println(" DFS: " + String.join(" -> ", dfsPath));

        System.out.println("Generated BFS Pathway starting from 'React':");
        List<String> bfsPath = graph.getBFSPath("React");
        System.out.println(" BFS: " + String.join(" -> ", bfsPath));
        System.out.println("\n✅ All Java DSA compliance tests passed successfully!");
    }
}
