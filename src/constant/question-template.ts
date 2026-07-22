export const SQL_LANGUAGE_ID = 82;

export const DEFAULT_SQL_SCHEMA = `-- Schema: define the tables the query runs against.
CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER,
    salary INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);`;

export const DEFAULT_SQL_SEED = `-- Seed: insert the data the query is evaluated against.
-- Marketing has no employees (exercises the "right join" side below); Dave
-- has no department (exercises the "left join" side below).
INSERT INTO departments (id, name) VALUES
    (1, 'Engineering'),
    (2, 'Sales'),
    (3, 'Marketing');

INSERT INTO employees (id, name, department_id, salary) VALUES
    (1, 'Alice', 1, 90000),
    (2, 'Bob', 1, 85000),
    (3, 'Carol', 2, 70000),
    (4, 'Dave', NULL, 60000);`;

export const DEFAULT_SQL_SOLUTION = `-- Reference query used to generate the expected result set.
-- Judge0's SQLite (3.27.2) has no RIGHT JOIN keyword (added upstream only in
-- SQLite 3.39+), so a right join is expressed by swapping the table order in
-- a LEFT JOIN instead. UNION-ing both directions emulates a full outer join:
-- Dave (no department) comes from the first LEFT JOIN, Marketing (no
-- employees) comes from the second -- the "right join" case.
SELECT e.name AS employee, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
UNION
SELECT e.name AS employee, d.name AS department
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
ORDER BY department, employee;`;

export const DEFAULT_SQL_STARTER = `-- Write your query here`;

export const INITIAL_CODES = {
    starter: {
        71: "# Starter Code (Python)\ndef add(a, b):\n    # Write your code here\n    pass",
        54: "// Starter Code (C++)\n#include <iostream>\n\nint add(int a, int b) {\n    // Write your code here\n    return 0;\n}",
        50: "// Starter Code (C)\n#include <stdio.h>\n\nint add(int a, int b) {\n    // Write your code here\n    return 0;\n}",
        62: "// Starter Code (Java)\npublic class Solution {\n    public int add(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}",
    },
    solution: {
        71: "# Solution Code (Python)\ndef add(a, b):\n    return a + b",
        54: "// Solution Code (C++)\n#include <iostream>\n\nint add(int a, int b) {\n    return a + b;\n}",
        50: "// Solution Code (C)\n#include <stdio.h>\n\nint add(int a, int b) {\n    return a + b;\n}",
        62: "// Solution Code (Java)\npublic class Solution {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}",
    },
    driver: {
        71: '# Driver Code (Python)\nif __name__ == "__main__":\n    import sys\n    input_data = sys.stdin.read().split()\n    if len(input_data) >= 2:\n        a, b = map(int, input_data[:2])\n        print(add(a, b))',
        54: "// Driver Code (C++)\n#include <iostream>\n\nint main() {\n    int a, b;\n    if (std::cin >> a >> b) {\n        std::cout << add(a, b) << std::endl;\n    }\n    return 0;\n}",
        50: '// Driver Code (C)\n#include <stdio.h>\n\nint main() {\n    int a, b;\n    if (scanf("%d %d", &a, &b) == 2) {\n        printf("%d\\n", add(a, b));\n    }\n    return 0;\n}',
        62: "// Driver Code (Java)\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(new Solution().add(a, b));\n        }\n    }\n}",
    },
};
