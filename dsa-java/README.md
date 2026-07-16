# SkillBridge AI — Java DSA Integration

This module implements core data structures and algorithms in Java to represent and traverse skill dependency hierarchies.

---

## 1. SkillGraph (DFS / BFS)

### Representation
- We chose a **Directed Acyclic Graph (DAG)** modeled via an **Adjacency List** (`Map<String, List<String>>`).
- This representation is optimized for sparse dependencies (each skill has 1-3 parents).

### Algorithms
- **DFS (Depth-First Search)**: Finds the deep nested pathway of prerequisites.
- **BFS (Breadth-First Search)**: Traverses level-by-level (recommends immediate siblings first).

| Operation | Time Complexity | Space Complexity |
|---|---|---|
| Pathway Generation (BFS/DFS) | O(V + E) | O(V) |

---

## 2. SkillHashMap

- Used for **O(1)** time complexity lookup of master skills registry metadata.

| Operation | Time Complexity | Space Complexity |
|---|---|---|
| Register / Add Skill | O(1) | O(V) |
| Lookup details | O(1) | O(1) |

---

## 3. PrioritySkillQueue

- Manages automated recommendation ranking. Uses a **Heap**-based implementation to prioritize critical/high gaps.

| Operation | Time Complexity | Space Complexity |
|---|---|---|
| Add missing skill | O(log N) | O(N) |
| Fetch high priority | O(log N) | O(1) |
| Peek highest priority | O(1) | O(1) |
