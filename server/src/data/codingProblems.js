export const CODING_PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    entryFunction: 'twoSum',
    prompt:
      'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Assume exactly one solution exists.',
    starterCode: 'function twoSum(nums, target) {\n  // your code here\n}\n',
    examples: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
    ],
    hiddenTestCases: [
      { input: [[3, 3], 6], expectedOutput: [0, 1] },
      { input: [[1, 5, 8, 10, 13], 18], expectedOutput: [2, 3] },
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse a String',
    difficulty: 'Easy',
    entryFunction: 'reverseString',
    prompt: 'Given a string `s`, return it reversed.',
    starterCode: 'function reverseString(s) {\n  // your code here\n}\n',
    examples: [
      { input: ['hello'], expectedOutput: 'olleh' },
      { input: ['ab'], expectedOutput: 'ba' },
    ],
    hiddenTestCases: [
      { input: [''], expectedOutput: '' },
      { input: ['racecar'], expectedOutput: 'racecar' },
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    entryFunction: 'isValid',
    prompt: 'Given a string `s` containing just the characters `()[]{}`, determine if the input string is valid (every bracket is closed in the correct order).',
    starterCode: 'function isValid(s) {\n  // your code here\n}\n',
    examples: [
      { input: ['()'], expectedOutput: true },
      { input: ['()[]{}'], expectedOutput: true },
      { input: ['(]'], expectedOutput: false },
    ],
    hiddenTestCases: [
      { input: ['{[]}'], expectedOutput: true },
      { input: ['('], expectedOutput: false },
      { input: [''], expectedOutput: true },
    ],
  },
  {
    id: 'linked-list-cycle',
    title: 'Detect a Cycle (as array-based next pointers)',
    difficulty: 'Medium',
    entryFunction: 'hasCycle',
    prompt:
      'A linked list is given as an array `next` where `next[i]` is the index of the node after node `i`, or -1 if it is the last node. Given a `start` index, return true if the list has a cycle.',
    starterCode: 'function hasCycle(next, start) {\n  // your code here\n}\n',
    examples: [
      { input: [[1, 2, 0], 0], expectedOutput: true },
      { input: [[1, 2, -1], 0], expectedOutput: false },
    ],
    hiddenTestCases: [
      { input: [[-1], 0], expectedOutput: false },
      { input: [[1, -1], 0], expectedOutput: false },
      { input: [[1, 2, 3, 1], 0], expectedOutput: true },
    ],
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    entryFunction: 'fizzBuzz',
    prompt:
      'Given an integer `n`, return an array of strings from 1 to n where multiples of 3 are "Fizz", multiples of 5 are "Buzz", multiples of both are "FizzBuzz", and all others are the number as a string.',
    starterCode: 'function fizzBuzz(n) {\n  // your code here\n}\n',
    examples: [{ input: [5], expectedOutput: ['1', '2', 'Fizz', '4', 'Buzz'] }],
    hiddenTestCases: [
      { input: [1], expectedOutput: ['1'] },
      { input: [15], expectedOutput: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'] },
    ],
  },
]

export function listProblems() {
  return CODING_PROBLEMS.map(({ id, title, difficulty }) => ({ id, title, difficulty }))
}

export function getProblem(id) {
  return CODING_PROBLEMS.find((p) => p.id === id) || null
}
