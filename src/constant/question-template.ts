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
