let nextId = 1
const q = (category, difficulty, question, answer) => ({ id: nextId++, category, difficulty, question, answer })

export const QUESTION_BANK = [
  // DSA
  q('DSA', 'Easy', 'What is the time complexity of binary search?', 'O(log n) — each step halves the search space.'),
  q('DSA', 'Easy', 'Difference between an array and a linked list?', 'Arrays are contiguous memory with O(1) index access but O(n) insert/delete; linked lists are non-contiguous with O(1) insert/delete at a known node but O(n) access.'),
  q('DSA', 'Medium', 'How does a hash map achieve average O(1) lookup?', 'It hashes the key to a bucket index; collisions are resolved with chaining or open addressing, keeping average chain length small with a good load factor.'),
  q('DSA', 'Medium', 'Explain the two-pointer technique with an example.', 'Two indices move through a structure (often from both ends or at different speeds) to avoid nested loops — e.g. finding a pair summing to a target in a sorted array in O(n).'),
  q('DSA', 'Medium', 'What is dynamic programming and when would you use it?', 'An optimization technique that breaks a problem into overlapping subproblems and caches results (memoization/tabulation) — use it when brute force recomputes the same subproblem repeatedly, like Fibonacci or knapsack.'),
  q('DSA', 'Hard', 'How would you detect a cycle in a directed graph?', "DFS with a 'visiting' and 'visited' state per node — if you reach a node that is currently 'visiting' on the same DFS path, there is a cycle."),

  // SQL
  q('SQL', 'Easy', 'Difference between INNER JOIN and LEFT JOIN?', 'INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table plus matches from the right (NULL where no match).'),
  q('SQL', 'Easy', 'What does a PRIMARY KEY guarantee?', 'Uniqueness and non-null for the column(s) — it uniquely identifies each row and is usually backed by an index.'),
  q('SQL', 'Medium', 'Difference between WHERE and HAVING?', 'WHERE filters rows before grouping/aggregation; HAVING filters groups after aggregation (e.g. HAVING COUNT(*) > 5).'),
  q('SQL', 'Medium', 'What is a database index and what is the tradeoff?', 'A data structure (often B-tree) that speeds up reads on a column at the cost of extra storage and slower writes, since the index must be updated too.'),
  q('SQL', 'Hard', 'How would you find the second-highest salary in a table?', 'e.g. SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees); or use DENSE_RANK() in a window function.'),

  // DBMS
  q('DBMS', 'Easy', 'What is normalization and why is it used?', 'Organizing tables to reduce data redundancy and avoid update/insert/delete anomalies, typically up to 3NF for most applications.'),
  q('DBMS', 'Medium', 'Explain ACID properties.', 'Atomicity (all-or-nothing), Consistency (valid state to valid state), Isolation (concurrent transactions don\'t interfere), Durability (committed data survives crashes).'),
  q('DBMS', 'Medium', 'What is the difference between a clustered and non-clustered index?', 'A clustered index determines the physical order of rows in the table (one per table); a non-clustered index is a separate structure pointing back to the row (many allowed).'),
  q('DBMS', 'Hard', 'What is a deadlock and how can a database detect or prevent it?', 'Two or more transactions waiting on locks held by each other in a cycle. Detected via wait-for graphs, prevented via lock ordering, timeouts, or optimistic concurrency.'),

  // OS
  q('OS', 'Easy', 'Difference between a process and a thread?', 'A process has its own memory space; threads within a process share memory but have separate stacks, making them lighter-weight to create and switch between.'),
  q('OS', 'Medium', 'What is a deadlock, and name the four necessary conditions.', 'A state where processes wait on each other forever. Conditions: mutual exclusion, hold and wait, no preemption, circular wait.'),
  q('OS', 'Medium', 'Explain paging and why it is used.', 'Paging splits memory into fixed-size pages/frames so a process\'s logical address space need not be contiguous in physical memory, avoiding external fragmentation.'),
  q('OS', 'Hard', 'Difference between a mutex and a semaphore?', 'A mutex is binary and owned by the thread that locked it (only it can unlock); a semaphore is a counter that can allow multiple holders and can be signalled by any thread.'),

  // Computer Networks
  q('Computer Networks', 'Easy', 'What happens when you type a URL and press enter?', 'DNS resolves the domain to an IP, a TCP (and TLS) connection is established, an HTTP request is sent, the server responds, and the browser renders the page.'),
  q('Computer Networks', 'Easy', 'Difference between TCP and UDP?', 'TCP is connection-oriented, reliable and ordered (with retransmission); UDP is connectionless, faster, and does not guarantee delivery or order.'),
  q('Computer Networks', 'Medium', 'What is the three-way handshake?', 'TCP connection setup: client sends SYN, server replies SYN-ACK, client replies ACK — both sides agree on initial sequence numbers before data flows.'),
  q('Computer Networks', 'Medium', 'What does DNS do and how does resolution work roughly?', 'Translates domain names to IP addresses via a hierarchy of resolvers: root → TLD → authoritative nameserver, with caching at each level.'),

  // OOPs
  q('OOPs', 'Easy', 'What are the four pillars of OOP?', 'Encapsulation, Abstraction, Inheritance, Polymorphism.'),
  q('OOPs', 'Easy', 'Difference between overloading and overriding?', 'Overloading is same method name with different parameters in the same class (compile-time); overriding is a subclass redefining a parent\'s method with the same signature (runtime).'),
  q('OOPs', 'Medium', 'What is the difference between an abstract class and an interface?', 'An abstract class can hold shared state and partial implementation and supports single inheritance; an interface (in most languages) only declares a contract and a class can implement many.'),
  q('OOPs', 'Hard', 'Explain the SOLID principles briefly.', 'Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion — guidelines for maintainable, extensible object-oriented design.'),

  // HR
  q('HR', 'Easy', 'Tell me about yourself.', 'A 60-90 second summary: who you are, 1-2 relevant projects/experiences, and why you are interested in this role — not your full life story.'),
  q('HR', 'Easy', 'Why do you want to work here?', 'Connect something specific about the company (product, mission, tech) to your own goals — avoid generic answers like "great culture".'),
  q('HR', 'Medium', 'Describe a conflict you had in a team and how you resolved it.', 'Use STAR: Situation, Task, Action, Result — be specific about what you personally did and what changed afterward.'),
  q('HR', 'Medium', 'What is your biggest weakness?', 'Name a real, non-fatal weakness and show what you are actively doing about it — avoid disguised strengths like "I work too hard".'),
  q('HR', 'Hard', 'Where do you see yourself in three years?', 'Show growth ambition that is plausible within this company/role, without over-promising a specific title.'),
]

export function getCategories() {
  const counts = {}
  for (const item of QUESTION_BANK) {
    counts[item.category] = (counts[item.category] || 0) + 1
  }
  return Object.entries(counts).map(([category, count]) => ({ category, count }))
}

export function listQuestions({ category, difficulty }) {
  return QUESTION_BANK.filter(
    (item) => (!category || item.category === category) && (!difficulty || item.difficulty === difficulty)
  ).map(({ id, category, difficulty, question }) => ({ id, category, difficulty, question }))
}

export function getQuestion(id) {
  return QUESTION_BANK.find((item) => item.id === Number(id)) || null
}
