import { CareerRoadmap, Difficulty, Level } from '../types';

export const normalizeCareerSlug = (career: string): string => {
  const lower = career.trim().toLowerCase();
  if (lower.includes('frontend') || lower.includes('front-end') || lower.includes('react')) {
    return 'frontend-engineer';
  }
  if (lower.includes('full-stack') || lower.includes('fullstack') || lower.includes('full stack')) {
    return 'fullstack-developer';
  }
  if (lower.includes('python') || lower.includes('ai') || lower.includes('machine learning') || lower.includes('data')) {
    return 'python-ai-engineer';
  }
  if (lower.includes('backend') || lower.includes('back-end') || lower.includes('distributed') || lower.includes('systems architect')) {
    return 'backend-systems-architect';
  }
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

export const buildChapterCacheKey = (careerTitle: string, levelId: number, levelTitle: string): string => {
  const careerSlug = normalizeCareerSlug(careerTitle);
  const titleSlug = levelTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32);
  return `${careerSlug}__ch${levelId}__${titleSlug}`;
};

interface CuratedTrackBlueprint {
  careerTitle: string;
  description: string;
  levels: Level[];
  chapterDetails: Record<number, Partial<Level>>;
}

const CURATED_TRACKS: Record<string, CuratedTrackBlueprint> = {
  'frontend-engineer': {
    careerTitle: 'Frontend Engineer',
    description: 'Master modern JavaScript, TypeScript, DOM state architecture, and high-performance React user interfaces through production-grade engineering simulations.',
    levels: [
      {
        id: 1,
        title: 'JavaScript State & Pure Data Transformations',
        difficulty: Difficulty.Beginner,
        description: 'Write predictable, bug-free state functions using immutable arrays, object transformations, and deterministic filtering.',
        topics: ['Variables & Data Types', 'Pure Functions', 'Array Map & Filter', 'Immutable State Updates']
      },
      {
        id: 2,
        title: 'Asynchronous Flows, Promises & API Resilience',
        difficulty: Difficulty.Beginner,
        description: 'Coordinate network requests, handle latency spikes, and implement retry-safe data fetching pipelines.',
        topics: ['Promises & Async/Await', 'Error Recovery & Try/Catch', 'Payload Normalization', 'Debounce & Rate Limiting']
      },
      {
        id: 3,
        title: 'Component Architecture & Derived UI State',
        difficulty: Difficulty.Intermediate,
        description: 'Design composable component trees, eliminate redundant state synchronization bugs, and compute derived view models.',
        topics: ['Unidirectional Data Flow', 'Derived State vs Effect Loops', 'Event Delegation', 'Controlled Form Validation']
      },
      {
        id: 4,
        title: 'Client Caching, Optimistic UI & Race Conditions',
        difficulty: Difficulty.Advanced,
        description: 'Prevent stale network responses from overwriting newer user actions and build snappy optimistic state mutations.',
        topics: ['Request Cancellation & AbortKeys', 'Optimistic Rollbacks', 'Stale-While-Revalidate Cache', 'Normalized Entity Stores']
      },
      {
        id: 5,
        title: 'Rendering Performance, Virtualization & Profiling',
        difficulty: Difficulty.Expert,
        description: 'Diagnose frame drops on 10,000-row datasets, memoize expensive calculations, and architect windowed list renderers.',
        topics: ['Viewport Windowing Math', 'Referential Equality & Memoization', 'Batching DOM Mutations', 'Memory Leak Prevention']
      }
    ],
    chapterDetails: {
      1: {
        isCached: true,
        teaching: {
          conceptExplanation:
            'Every interactive web application—whether it is a shopping cart, a financial dashboard, or a code editor—is fundamentally a state machine. Data enters your application as raw arrays and objects from an API, and your job as a Frontend Engineer is to transform that data into the exact shape the screen needs without corrupting the original state.\n\nIn this first chapter, you will master pure data transformations in JavaScript. Instead of mutating variables in place (which causes subtle UI rendering bugs where components fail to update), you will write deterministic functions that filter, compute, and return fresh state snapshots.',
          practicalGuide: 'Read through each section, examine the input/output transformation patterns, and complete the Cart State Engine assignment using the live test runner.',
          keyTakeaway: 'Never mutate UI state arrays in place; use pure functions with .filter(), .map(), and .reduce() so state transitions are 100% predictable and testable.',
          sections: [
            {
              title: '1. Pure Functions & Predictable State',
              theory:
                'A function is "pure" when given the exact same inputs, it always returns the exact same output and produces zero side effects outside its scope. In modern frontend frameworks like React, UI re-renders are triggered by comparing old state references with new state references (`prevState !== nextState`).\n\nWhen you modify an existing array using `.push()` or `.splice()`, the memory reference stays identical, causing your UI to freeze or display stale numbers. Writing pure functions guarantees every state update produces a clean, traceable value.',
              syntaxRule: 'const updateItems = (items, newItem) => [...items, newItem];',
              codeLanguage: 'javascript',
              codeExample: `// Pure function: does NOT mutate the original cart array
function addDiscountedItem(cart, item, discountRate) {
  const finalPrice = Math.round(item.price * (1 - discountRate));
  const updatedItem = {
    ...item,
    price: finalPrice,
    discounted: discountRate > 0
  };
  return [...cart, updatedItem];
}

const initialCart = [{ id: 'p1', name: 'Mechanical Keyboard', price: 120 }];
const nextCart = addDiscountedItem(initialCart, { id: 'p2', name: 'USB-C Cable', price: 20 }, 0.25);

console.log('Original length:', initialCart.length);
console.log('New length:', nextCart.length);
console.log('Added item price:', nextCart[1].price);`,
              codeOutput: `Original length: 1
New length: 2
Added item price: 15`,
              explanation:
                'By using the spread operator (`...cart` and `...item`), `initialCart` remains untouched with 1 item, while `nextCart` is a brand-new array containing 2 items with the 25% discount applied.'
            },
            {
              title: '2. Transforming & Filtering Collections',
              theory:
                'Dashboards and product catalogs constantly filter and reshape arrays of objects. Rather than writing manual `for` loops with temporary counter variables, chaining `.filter()` and `.map()` lets you express business rules declaratively.\n\nUse `.filter(predicate)` to keep only elements matching a condition, and `.map(transformer)` to project each element into a new shape.',
              syntaxRule: 'const activeNames = users.filter(u => u.isActive).map(u => u.name);',
              codeLanguage: 'javascript',
              codeExample: `const orders = [
  { id: 'ORD-101', status: 'paid', amount: 45 },
  { id: 'ORD-102', status: 'refunded', amount: 120 },
  { id: 'ORD-103', status: 'paid', amount: 85 }
];

function getPaidOrderSummaries(orderList) {
  return orderList
    .filter(order => order.status === 'paid')
    .map(order => \`\${order.id}: $\${order.amount}\`);
}

console.log(getPaidOrderSummaries(orders));`,
              codeOutput: `["ORD-101: $45", "ORD-103: $85"]`,
              explanation:
                'First, `.filter()` removes `ORD-102` because its status is `refunded`. Next, `.map()` formats the remaining two paid orders into clean display strings.'
            },
            {
              title: '3. Aggregating Metrics with .reduce()',
              theory:
                'When you need to collapse an entire array of items into a single summary metric—such as a checkout subtotal, an average latency score, or a lookup dictionary—`.reduce()` is the cleanest tool for the job.\n\nAlways pass an explicit initial value (such as `0` for sums or `{}` for lookup maps) as the second argument to `.reduce()` so your function never crashes on an empty array.',
              syntaxRule: 'const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);',
              codeLanguage: 'javascript',
              codeExample: `function calculateCartSummary(items) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const itemCount = items.reduce((acc, item) => acc + item.qty, 0);
  return { subtotal, itemCount };
}

const cart = [
  { name: 'Pro Subscription', price: 15, qty: 2 },
  { name: 'Cloud Sandbox Addon', price: 10, qty: 1 }
];

console.log(calculateCartSummary(cart));`,
              codeOutput: `{ subtotal: 40, itemCount: 3 }`,
              explanation:
                '`subtotal` multiplies each item price by its quantity (`15*2 + 10*1 = 40`), and `itemCount` sums the quantities (`2 + 1 = 3`). If `cart` were empty `[]`, both safely return `0`.'
            },
            {
              title: '4. Putting It All Together: Complete Checkout State Engine',
              theory:
                'In a production checkout flow, you combine filtering, mapping, and reducing into a single deterministic selector function. It filters out out-of-stock or zero-quantity items, applies coupon rules, and returns a structured summary object ready for the UI.',
              syntaxRule: 'function computeCheckout(items, couponOff) { /* filter -> reduce -> return summary */ }',
              codeLanguage: 'javascript',
              codeExample: `function computeCheckout(items, discountPercent = 0) {
  const validItems = items.filter(item => item.inStock && item.qty > 0);
  const rawTotal = validItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = Math.round(rawTotal * (discountPercent / 100));

  return {
    activeSkus: validItems.map(i => i.sku),
    subtotal: rawTotal,
    finalTotal: Math.max(0, rawTotal - discountAmount)
  };
}

const sampleCart = [
  { sku: 'KB-01', price: 100, qty: 1, inStock: true },
  { sku: 'MS-02', price: 50, qty: 2, inStock: true },
  { sku: 'MN-03', price: 300, qty: 1, inStock: false }
];

console.log(computeCheckout(sampleCart, 10));`,
              codeOutput: `{ activeSkus: ["KB-01", "MS-02"], subtotal: 200, finalTotal: 180 }`,
              explanation:
                'Out-of-stock item `MN-03` is excluded first. The remaining items total `$200` (`100*1 + 50*2`), and the 10% coupon subtracts `$20` for a `finalTotal` of `180`.'
            }
          ],
          pitfalls: [
            {
              mistake: 'Forgetting the initial accumulator value in .reduce()',
              whyItHappens: 'Developers omit the `, 0` at the end of `.reduce()`, causing JavaScript to use the first object in the array as the initial number, resulting in `"[object Object]50"` string concatenation bugs or crashes on empty arrays.',
              fix: 'Always pass `0` as the second argument when summing numbers with `.reduce((sum, item) => ..., 0)`.',
              badCode: `// Crashes on empty array [] and produces "[object Object]..." on objects!
const total = items.reduce((sum, item) => sum + item.price);`,
              goodCode: `// Safe on empty arrays and always returns a number
const total = items.reduce((sum, item) => sum + item.price, 0);`
            },
            {
              mistake: 'Mutating objects inside .map()',
              whyItHappens: 'Directly reassigning `item.price = ...` inside `.map()` mutates the original state object in memory.',
              fix: 'Return a cloned object `{ ...item, price: newPrice }` inside `.map()`.',
              badCode: `const discounted = items.map(item => {
  item.price = item.price * 0.9; // Mutates original state!
  return item;
});`,
              goodCode: `const discounted = items.map(item => ({
  ...item,
  price: item.price * 0.9
}));`
            }
          ]
        },
        resources: [
          {
            title: 'JavaScript Array Methods: map, filter, and reduce Explained',
            type: 'video',
            url: 'https://www.youtube.com/results?search_query=javascript+array+map+filter+reduce+tutorial',
            description: 'Visual walkthrough of immutable array methods for frontend state management.',
            source: 'Traversy Media',
            isVerified: false
          },
          {
            title: 'Immutability & Pure Functions in Modern Frontend Architecture',
            type: 'video',
            url: 'https://www.youtube.com/results?search_query=javascript+pure+functions+immutability+react',
            description: 'Why mutating objects breaks UI rendering and how spread operators solve it.',
            source: 'Fireship',
            isVerified: false
          }
        ],
        projects: [
          {
            id: 'fe-ch1-cart-engine',
            title: 'Immutable Checkout & Coupon State Engine',
            description: 'Build a pure `calculateOrderSummary(items, couponCode)` function that filters valid line items, applies tiered coupon codes ("SAVE10" or "SAVE20"), and returns a deterministic order summary without mutating the input array.',
            difficulty: 'Beginner',
            language: 'javascript',
            requirements: [
              'Filter out any item where `qty <= 0` or `inStock === false`.',
              'Calculate `subtotal` as the sum of `price * qty` for all valid items (return 0 if empty).',
              'If `couponCode === "SAVE10"`, apply a 10% discount; if `"SAVE20"`, apply a 20% discount (round `finalTotal` using `Math.round`).',
              'Return `{ validCount, subtotal, finalTotal, skus }` where `skus` is an array of valid item SKU strings.'
            ],
            starterCode: `// Assignment: Immutable Checkout & Coupon State Engine
// Run the test suite (Cmd/Ctrl + Enter) to verify all 4 unit tests pass!

function calculateOrderSummary(items, couponCode = "") {
  // STEP 1: Filter items to keep only those with inStock === true and qty > 0
  const validItems = items.filter(item => item.inStock === true && item.qty > 0);

  // STEP 2: Compute subtotal using .reduce() (remember initial value 0)
  const subtotal = validItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // STEP 3: Determine discount rate based on couponCode ("SAVE10" -> 0.10, "SAVE20" -> 0.20)
  let discountRate = 0;
  if (couponCode === "SAVE10") discountRate = 0.10;
  if (couponCode === "SAVE20") discountRate = 0.20;

  const finalTotal = Math.round(subtotal * (1 - discountRate));

  // STEP 4: Return the summary object with validCount, subtotal, finalTotal, and skus
  return {
    validCount: validItems.length,
    subtotal,
    finalTotal,
    skus: validItems.map(item => item.sku)
  };
}

// Quick console check:
console.log(calculateOrderSummary([
  { sku: "DEV-1", price: 100, qty: 2, inStock: true },
  { sku: "DEV-2", price: 50, qty: 0, inStock: true }
], "SAVE10"));
`,
            walkthrough: 'Filter the input array with `items.filter(i => i.inStock && i.qty > 0)`, sum `price * qty` with `.reduce()`, apply the coupon multiplier (`0.9` for SAVE10, `0.8` for SAVE20), and project `.map(i => i.sku)`.',
            hints: [
              'Use `items.filter(item => item.inStock && item.qty > 0)` so neither out-of-stock nor zero-quantity items enter your subtotal.',
              'Calculate `subtotal` with `validItems.reduce((sum, i) => sum + i.price * i.qty, 0)`.',
              'Map SKUs with `validItems.map(i => i.sku)` and compute `Math.round(subtotal * (1 - discountRate))`.'
            ],
            testCases: [
              {
                id: 'tc-1',
                name: 'Filters out-of-stock and zero-qty items accurately',
                inputDescription: '3 items (1 out of stock, 1 with qty 0, 1 valid $100 x 2)',
                expectedOutput: '{"validCount":1,"subtotal":200,"finalTotal":200,"skus":["A1"]}',
                testCode: `JSON.stringify(calculateOrderSummary([{sku:"A1",price:100,qty:2,inStock:true},{sku:"B2",price:50,qty:0,inStock:true},{sku:"C3",price:80,qty:1,inStock:false}], ""))`
              },
              {
                id: 'tc-2',
                name: 'Applies SAVE10 and SAVE20 coupon discounts correctly',
                inputDescription: '2 valid items totaling $150 with coupon "SAVE20"',
                expectedOutput: '{"validCount":2,"subtotal":150,"finalTotal":120,"skus":["K1","K2"]}',
                testCode: `JSON.stringify(calculateOrderSummary([{sku:"K1",price:100,qty:1,inStock:true},{sku:"K2",price:25,qty:2,inStock:true}], "SAVE20"))`
              },
              {
                id: 'tc-3',
                name: 'Handles empty cart array without throwing',
                inputDescription: 'calculateOrderSummary([], "SAVE10")',
                expectedOutput: '{"validCount":0,"subtotal":0,"finalTotal":0,"skus":[]}',
                testCode: `JSON.stringify(calculateOrderSummary([], "SAVE10"))`
              }
            ]
          }
        ]
      }
    }
  },
  'fullstack-developer': {
    careerTitle: 'Full-Stack Developer',
    description: 'Build end-to-end web systems spanning REST/RPC API controllers, authentication middleware, relational schemas, and reactive client state.',
    levels: [
      {
        id: 1,
        title: 'REST API Request Validation & Payload Sanitization',
        difficulty: Difficulty.Beginner,
        description: 'Validate incoming JSON request bodies, normalize user fields, and return structured HTTP status payloads.',
        topics: ['Request Schema Validation', 'HTTP Status Codes (200/400/422)', 'Input Sanitization', 'Structured Error Envelopes']
      },
      {
        id: 2,
        title: 'Authentication Tokens, Sessions & RBAC Middleware',
        difficulty: Difficulty.Beginner,
        description: 'Protect private API routes with token verification, expiration checks, and role-based access control gates.',
        topics: ['Bearer Token Parsing', 'Session Expiry Checks', 'Role-Based Access Control (RBAC)', 'Middleware Chaining']
      },
      {
        id: 3,
        title: 'Relational Data Modeling, Joins & Pagination',
        difficulty: Difficulty.Intermediate,
        description: 'Design normalized database tables, cursor-based pagination, and prevent N+1 query bottlenecks.',
        topics: ['Primary & Foreign Keys', 'Cursor vs Offset Pagination', 'N+1 Query Elimination', 'Transactional Integrity']
      },
      {
        id: 4,
        title: 'Idempotent Webhooks & Payment State Machines',
        difficulty: Difficulty.Advanced,
        description: 'Process third-party webhooks safely with idempotency keys so duplicate events never double-charge users.',
        topics: ['Idempotency Keys', 'Webhook Signature Verification', 'State Machine Transitions', 'Dead-Letter Retries']
      },
      {
        id: 5,
        title: 'Rate Limiting, Caching Layers & Production Observability',
        difficulty: Difficulty.Expert,
        description: 'Implement sliding-window rate limiters, cache invalidation strategies, and structured request tracing.',
        topics: ['Token Bucket & Sliding Window', 'Cache-Aside Invalidation', 'Structured Audit Logs', 'Graceful Degradation']
      }
    ],
    chapterDetails: {
      1: {
        isCached: true,
        teaching: {
          conceptExplanation:
            'The boundary between a frontend client and a backend server is the #1 source of production outages and security vulnerabilities. You can never trust data sent from a browser—anyone can bypass frontend form validation using `curl` or Postman and send malformed JSON, negative quantities, or unnormalized email addresses.\n\nIn this chapter, you will build a deterministic API Request Validator & Controller that sanitizes user payloads and returns standardized `{ status, ok, data, errors }` HTTP envelopes.',
          practicalGuide: 'Study how backend controllers validate every field before touching the database, then test your validator against valid and malformed payloads.',
          keyTakeaway: 'Validate and normalize every incoming request field at the API boundary before executing business logic or database writes.',
          sections: [
            {
              title: '1. Standardized API Response Envelopes',
              theory:
                'Full-stack applications become brittle when different endpoints return inconsistent shapes (e.g., one returns `{ error: "bad" }`, another returns `["invalid email"]`). Defining a strict response envelope ensures your frontend client can handle every response uniformly.',
              syntaxRule: 'return { status: 400, ok: false, errors: ["Email is required"] };',
              codeLanguage: 'javascript',
              codeExample: `function createApiResponse(status, data = null, errors = []) {
  return {
    status,
    ok: status >= 200 && status < 300,
    data,
    errors
  };
}

console.log(createApiResponse(201, { userId: 'usr_1' }));
console.log(createApiResponse(400, null, ['Invalid email format']));`,
              codeOutput: `{ status: 201, ok: true, data: { userId: "usr_1" }, errors: [] }
{ status: 400, ok: false, data: null, errors: ["Invalid email format"] }`,
              explanation:
                'Any `2xx` status automatically sets `ok: true` with the payload in `data`, while `4xx` validation failures set `ok: false` and collect human-readable error strings.'
            },
            {
              title: '2. Sanitizing Strings & Normalizing Emails',
              theory:
                'Users frequently type accidental leading/trailing spaces or uppercase letters in their email (`"  Alex@Domain.COM "`). If you store that raw string in your database, looking up `"alex@domain.com"` later will fail or allow duplicate accounts.',
              syntaxRule: 'const cleanEmail = String(rawEmail || "").trim().toLowerCase();',
              codeLanguage: 'javascript',
              codeExample: `function normalizeUserInput(payload) {
  const email = String(payload?.email || '').trim().toLowerCase();
  const name = String(payload?.name || '').trim();
  return { email, name };
}

console.log(normalizeUserInput({ email: '  Dev@SimSkills.IO ', name: '  Ada Lovelace ' }));`,
              codeOutput: `{ email: "dev@simskills.io", name: "Ada Lovelace" }`,
              explanation:
                'Using `.trim()` and `.toLowerCase()` guarantees canonical storage in your database.'
            },
            {
              title: '3. Collecting All Validation Errors at Once',
              theory:
                'Returning only the first validation error forces users to play whack-a-mole—fixing one field only to discover another field is also invalid. Instead, accumulate all field errors into an `errors` array and check `errors.length > 0` at the end.',
              syntaxRule: 'if (!email.includes("@")) errors.push("Valid email is required");',
              codeLanguage: 'javascript',
              codeExample: `function validateSignup(body) {
  const errors = [];
  const email = String(body?.email || '').trim().toLowerCase();
  const age = Number(body?.age);

  if (!email || !email.includes('@')) errors.push('Valid email required');
  if (Number.isNaN(age) || age < 13) errors.push('User must be at least 13');

  return { isValid: errors.length === 0, errors };
}

console.log(validateSignup({ email: 'invalid', age: 10 }));`,
              codeOutput: `{ isValid: false, errors: ["Valid email required", "User must be at least 13"] }`,
              explanation:
                'Both invalid fields are caught in a single pass so the frontend form can highlight both inputs simultaneously.'
            },
            {
              title: '4. Putting It All Together: Complete Endpoint Handler',
              theory:
                'Combining normalization, multi-field validation, and response envelopes produces a clean, testable controller function that is ready to mount on an Express or Next.js route.',
              syntaxRule: 'function handleCreateAccount(reqBody) { /* normalize -> validate -> return envelope */ }',
              codeLanguage: 'javascript',
              codeExample: `function handleCreateAccount(reqBody) {
  const errors = [];
  const email = String(reqBody?.email || '').trim().toLowerCase();
  const name = String(reqBody?.name || '').trim();
  const role = reqBody?.role || 'member';

  if (!name || name.length < 2) errors.push('Name must be at least 2 characters');
  if (!email.includes('@') || !email.includes('.')) errors.push('Invalid email address');
  if (!['member', 'admin'].includes(role)) errors.push('Invalid role');

  if (errors.length > 0) {
    return { status: 400, ok: false, data: null, errors };
  }

  return {
    status: 201,
    ok: true,
    data: { name, email, role },
    errors: []
  };
}

console.log(handleCreateAccount({ name: 'Linus', email: 'LINUS@kernel.org' }));`,
              codeOutput: `{ status: 201, ok: true, data: { name: "Linus", email: "linus@kernel.org", role: "member" }, errors: [] }`,
              explanation:
                'Valid requests return HTTP `201` with normalized fields and default role `"member"`, while invalid requests return HTTP `400` with explicit field error messages.'
            }
          ],
          pitfalls: [
            {
              mistake: 'Returning HTTP 200 OK when validation fails',
              whyItHappens: 'Returning `{ status: 200, error: "Failed" }` tricks HTTP clients, API gateways, and monitoring tools into thinking the request succeeded.',
              fix: 'Always return status `400` or `422` when client input fails validation.',
              badCode: `return { status: 200, ok: false, errors: ["Missing email"] };`,
              goodCode: `return { status: 400, ok: false, errors: ["Missing email"] };`
            }
          ]
        },
        resources: [
          {
            title: 'REST API Design Best Practices & Request Validation',
            type: 'video',
            url: 'https://www.youtube.com/results?search_query=rest+api+validation+error+handling+nodejs',
            description: 'How production Node/TypeScript backends structure request validation and HTTP status codes.',
            source: 'Traversy Media',
            isVerified: false
          }
        ],
        projects: [
          {
            id: 'fs-ch1-api-validator',
            title: 'REST Account Provisioning Controller',
            description: 'Implement `validateAndCreateUser(payload)` to sanitize user input, enforce field validation rules, and return a standardized HTTP response envelope (`201` on success, `400` on validation error).',
            difficulty: 'Beginner',
            language: 'javascript',
            requirements: [
              'Normalize `email` (trim + lowercase) and `name` (trim). Default `plan` to `"free"` if not provided.',
              'Validate: `name.length >= 2`, `email` contains `"@"`, and `plan` is either `"free"` or `"pro"`.',
              'If any rule fails, return `{ status: 400, ok: false, data: null, errors }` containing all error messages.',
              'If valid, return `{ status: 201, ok: true, data: { name, email, plan }, errors: [] }`.'
            ],
            starterCode: `// Assignment: REST Account Provisioning Controller
// Press Run & Test (Cmd/Ctrl + Enter) to run the automated test suite!

function validateAndCreateUser(payload) {
  const errors = [];
  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  const plan = payload?.plan || "free";

  if (name.length < 2) {
    errors.push("Name must be at least 2 characters");
  }
  if (!email.includes("@")) {
    errors.push("Valid email is required");
  }
  if (plan !== "free" && plan !== "pro") {
    errors.push("Invalid plan tier");
  }

  if (errors.length > 0) {
    return { status: 400, ok: false, data: null, errors };
  }

  return {
    status: 201,
    ok: true,
    data: { name, email, plan },
    errors: []
  };
}

console.log(validateAndCreateUser({ name: "  Grace Hopper ", email: "GRACE@navy.mil" }));
`,
            walkthrough: 'Trim and lowercase the inputs, push validation errors into `errors[]`, return status 400 if `errors.length > 0`, otherwise return status 201 with `{ name, email, plan }`.',
            hints: [
              'Normalize `email` using `String(payload?.email || "").trim().toLowerCase()`.',
              'Check `plan !== "free" && plan !== "pro"` to catch unsupported plan values.',
              'Return `{ status: 201, ok: true, data: { name, email, plan }, errors: [] }` when `errors.length === 0`.'
            ],
            testCases: [
              {
                id: 'fs-tc-1',
                name: 'Normalizes valid payload and defaults plan to free (201)',
                inputDescription: '{ name: "  Grace ", email: "GRACE@dev.io" }',
                expectedOutput: '{"status":201,"ok":true,"data":{"name":"Grace","email":"grace@dev.io","plan":"free"},"errors":[]}',
                testCode: `JSON.stringify(validateAndCreateUser({ name: "  Grace ", email: "GRACE@dev.io" }))`
              },
              {
                id: 'fs-tc-2',
                name: 'Rejects invalid email and short name with HTTP 400',
                inputDescription: '{ name: "A", email: "invalid-email", plan: "pro" }',
                expectedOutput: '400:false:2',
                testCode: `(() => { const r = validateAndCreateUser({ name: "A", email: "invalid-email", plan: "pro" }); return \`\${r.status}:\${r.ok}:\${r.errors.length}\`; })()`
              },
              {
                id: 'fs-tc-3',
                name: 'Rejects unsupported plan tier with HTTP 400',
                inputDescription: '{ name: "Alex", email: "alex@dev.io", plan: "enterprise" }',
                expectedOutput: '400:false:1',
                testCode: `(() => { const r = validateAndCreateUser({ name: "Alex", email: "alex@dev.io", plan: "enterprise" }); return \`\${r.status}:\${r.ok}:\${r.errors.length}\`; })()`
              }
            ]
          }
        ]
      }
    }
  },
  'python-ai-engineer': {
    careerTitle: 'Python & AI Engineer',
    description: 'Master Python data structures, algorithmic pipelines, vector embeddings, and resilient LLM orchestration workflows.',
    levels: [
      {
        id: 1,
        title: 'Python Data Structures, List Comprehensions & Clean Pipelines',
        difficulty: Difficulty.Beginner,
        description: 'Process structured datasets cleanly using Python dictionaries, list comprehensions, and deterministic data cleaning functions.',
        topics: ['Lists & Dictionaries', 'List Comprehensions', 'Data Normalization', 'Pure Pipeline Functions']
      },
      {
        id: 2,
        title: 'Text Tokenization, Chunking & Context Window Math',
        difficulty: Difficulty.Beginner,
        description: 'Split documents into overlapping token chunks and calculate context budgets for retrieval-augmented generation (RAG).',
        topics: ['Document Chunking', 'Sliding Window Overlap', 'Token Budget Estimation', 'Metadata Tagging']
      },
      {
        id: 3,
        title: 'Vector Similarity, Cosine Distance & Hybrid Search',
        difficulty: Difficulty.Intermediate,
        description: 'Implement cosine similarity scoring, rank candidate passages, and fuse keyword + semantic search scores.',
        topics: ['Dot Product & Magnitude', 'Cosine Similarity Ranking', 'Top-K Filtering', 'Reciprocal Rank Fusion']
      },
      {
        id: 4,
        title: 'Structured Output Extraction & Retry Guardrails',
        difficulty: Difficulty.Advanced,
        description: 'Enforce strict schema validation on model outputs and build self-healing retry loops when parsing fails.',
        topics: ['JSON Schema Guardrails', 'Deterministic Fallbacks', 'Prompt Injection Filtering', 'Latency & Cost Tracking']
      },
      {
        id: 5,
        title: 'Evaluation Harnesses (Evals) & Hallucination Detection',
        difficulty: Difficulty.Expert,
        description: 'Build automated evaluation suites that measure precision, recall, and groundedness across golden test datasets.',
        topics: ['Golden Dataset Evals', 'Precision & Recall Metrics', 'Citation Grounding Checks', 'Regression Gates']
      }
    ],
    chapterDetails: {
      1: {
        isCached: true,
        teaching: {
          conceptExplanation:
            'Every AI or machine learning pipeline spends 80% of its execution time preparing, cleaning, and filtering raw data before a model ever sees it. If noisy, duplicate, or out-of-range records enter your prompt or training batch, output quality collapses.\n\nIn this chapter, you will master Python data transformation pipelines using dictionaries and list comprehensions to filter, normalize, and aggregate telemetry records cleanly.',
          practicalGuide: 'Review the Python list comprehension and dictionary aggregation patterns below, then run the automated test suite on your data cleaning pipeline.',
          keyTakeaway: 'Use Python list comprehensions and dictionary aggregations to build readable, single-pass data cleaning pipelines.',
          sections: [
            {
              title: '1. Filtering & Transforming with List Comprehensions',
              theory:
                'In Python, list comprehensions `[expr for item in iterable if condition]` let you filter and transform datasets in a single expressive line that executes faster than manual `.append()` loops.',
              syntaxRule: 'clean_scores = [round(s, 2) for s in raw_scores if s >= 0.5]',
              codeLanguage: 'python',
              codeExample: `records = [
    {"id": "doc_1", "score": 0.91, "valid": True},
    {"id": "doc_2", "score": 0.32, "valid": True},
    {"id": "doc_3", "score": 0.84, "valid": False},
    {"id": "doc_4", "score": 0.76, "valid": True}
]

high_confidence_ids = [
    r["id"] for r in records
    if r["valid"] and r["score"] >= 0.70
]

print("Filtered IDs:", high_confidence_ids)`,
              codeOutput: `Filtered IDs: ['doc_1', 'doc_4']`,
              explanation:
                'Only records where `valid` is `True` AND `score >= 0.70` are kept, projecting their `"id"` strings into `high_confidence_ids`.'
            },
            {
              title: '2. Safe Dictionary Access with .get()',
              theory:
                'Real-world JSON logs and API payloads frequently have missing keys. Accessing `record["tokens"]` directly raises a `KeyError` and crashes your batch job. Using `record.get("tokens", 0)` provides a safe fallback value.',
              syntaxRule: 'token_count = record.get("tokens", 0)',
              codeLanguage: 'python',
              codeExample: `batch = [
    {"prompt": "Summarize report", "tokens": 120},
    {"prompt": "Empty log"},
    {"prompt": "Translate snippet", "tokens": 80}
]

total_tokens = sum(item.get("tokens", 0) for item in batch)
print("Total tokens:", total_tokens)`,
              codeOutput: `Total tokens: 200`,
              explanation:
                'The second dictionary is missing `"tokens"`, so `.get("tokens", 0)` safely returns `0` instead of raising a `KeyError`.'
            },
            {
              title: '3. Normalizing & Deduplicating Text Prompts',
              theory:
                'Before sending text prompts to an embedding model, stripping whitespace and deduplicating entries prevents paying twice for identical embeddings.',
              syntaxRule: 'normalized = text.strip().lower()',
              codeLanguage: 'python',
              codeExample: `def clean_prompts(raw_list):
    seen = set()
    cleaned = []
    for text in raw_list:
        norm = text.strip()
        if len(norm) > 0 and norm.lower() not in seen:
            seen.add(norm.lower())
            cleaned.append(norm)
    return cleaned

print(clean_prompts(["  Hello AI ", "hello ai", "", "Vector Search"]))`,
              codeOutput: `['Hello AI', 'Vector Search']`,
              explanation:
                'Empty strings and case-insensitive duplicates (`"hello ai"`) are filtered out while preserving original casing of the first occurrence.'
            },
            {
              title: '4. Putting It All Together: AI Dataset Batch Cleaner',
              theory:
                'Combining safe dictionary lookups, confidence threshold filtering, and summary metrics creates a production-ready dataset preprocessor.',
              syntaxRule: 'def summarize_batch(samples, min_score=0.7): ...',
              codeLanguage: 'python',
              codeExample: `def summarize_batch(samples, min_score=0.7):
    kept = [
        s for s in samples
        if s.get("valid", False) and s.get("score", 0) >= min_score
    ]
    total_tokens = sum(s.get("tokens", 0) for s in kept)
    return {
        "kept_count": len(kept),
        "total_tokens": total_tokens,
        "ids": [s["id"] for s in kept]
    }

data = [
    {"id": "s1", "score": 0.88, "tokens": 150, "valid": True},
    {"id": "s2", "score": 0.45, "tokens": 90, "valid": True},
    {"id": "s3", "score": 0.92, "tokens": 200, "valid": True}
]
print(summarize_batch(data, 0.7))`,
              codeOutput: `{'kept_count': 2, 'total_tokens': 350, 'ids': ['s1', 's3']}`,
              explanation:
                'Samples `s1` and `s3` pass the `0.7` confidence threshold, totaling `350` tokens.'
            }
          ],
          pitfalls: [
            {
              mistake: 'Using mutable default arguments like def process(items=[])',
              whyItHappens: 'Python evaluates default list/dict arguments once when the function is defined, not on each call, causing state to leak across calls.',
              fix: 'Use `None` as the default and initialize `if items is None: items = []` inside the function.',
              badCode: `def append_item(val, bucket=[]):\n    bucket.append(val)\n    return bucket`,
              goodCode: `def append_item(val, bucket=None):\n    if bucket is None:\n        bucket = []\n    bucket.append(val)\n    return bucket`
            }
          ]
        },
        resources: [
          {
            title: 'Python List Comprehensions & Data Pipelines Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/results?search_query=python+list+comprehensions+data+processing+tutorial',
            description: 'Writing clean, idiomatic Python transformations for data and AI engineering.',
            source: 'Corey Schafer',
            isVerified: false
          }
        ],
        projects: [
          {
            id: 'py-ch1-batch-cleaner',
            title: 'RAG Dataset Batch Filter & Token Counter',
            description: 'Write a Python function `filter_training_batch(records, min_score)` that filters valid training samples at or above `min_score`, sums their `tokens` safely using `.get()`, and returns a summary dictionary.',
            difficulty: 'Beginner',
            language: 'python',
            requirements: [
              'Keep only records where `record.get("valid", False)` is True and `record.get("score", 0) >= min_score`.',
              'Compute `total_tokens` as the sum of `record.get("tokens", 0)` across all kept records.',
              'Return a dictionary `{"kept_count": ..., "total_tokens": ..., "ids": [...]}`.'
            ],
            starterCode: `# Assignment: RAG Dataset Batch Filter & Token Counter
# Click Run & Test (Cmd/Ctrl + Enter) to verify your Python pipeline!

def filter_training_batch(records, min_score=0.75):
    # STEP 1: Filter records where valid is True and score >= min_score
    kept = [
        r for r in records
        if r.get("valid", False) and r.get("score", 0) >= min_score
    ]

    # STEP 2: Sum tokens across kept records safely with .get("tokens", 0)
    total_tokens = sum(r.get("tokens", 0) for r in kept)

    # STEP 3: Return summary dictionary
    return {
        "kept_count": len(kept),
        "total_tokens": total_tokens,
        "ids": [r["id"] for r in kept]
    }

sample_batch = [
    {"id": "chunk_1", "score": 0.92, "tokens": 120, "valid": True},
    {"id": "chunk_2", "score": 0.60, "tokens": 80, "valid": True},
    {"id": "chunk_3", "score": 0.85, "tokens": 150, "valid": True}
]
print(filter_training_batch(sample_batch, 0.75))
`,
            walkthrough: 'Use a list comprehension to filter `records` by `r.get("valid", False)` and `r.get("score", 0) >= min_score`, sum `r.get("tokens", 0)`, and return `kept_count`, `total_tokens`, and `ids`.',
            hints: [
              'Use `r.get("valid", False)` and `r.get("score", 0) >= min_score` inside your list comprehension.',
              'Sum tokens with `sum(r.get("tokens", 0) for r in kept)`.',
              'Extract IDs with `[r["id"] for r in kept]`.'
            ],
            testCases: [
              {
                id: 'py-tc-1',
                name: 'Filters records below min_score and sums tokens accurately',
                inputDescription: '3 chunks (scores 0.92, 0.60, 0.85) with min_score=0.75',
                expectedOutput: "{'kept_count': 2, 'total_tokens': 270, 'ids': ['chunk_1', 'chunk_3']}",
                testCode: `filter_training_batch([{"id": "chunk_1", "score": 0.92, "tokens": 120, "valid": True}, {"id": "chunk_2", "score": 0.60, "tokens": 80, "valid": True}, {"id": "chunk_3", "score": 0.85, "tokens": 150, "valid": True}], 0.75)`
              },
              {
                id: 'py-tc-2',
                name: 'Excludes records where valid is False even if score is high',
                inputDescription: '2 chunks (one valid=False with score 0.99)',
                expectedOutput: "{'kept_count': 1, 'total_tokens': 100, 'ids': ['c1']}",
                testCode: `filter_training_batch([{"id": "c1", "score": 0.80, "tokens": 100, "valid": True}, {"id": "c2", "score": 0.99, "tokens": 500, "valid": False}], 0.75)`
              },
              {
                id: 'py-tc-3',
                name: 'Handles empty batch list safely',
                inputDescription: 'filter_training_batch([], 0.75)',
                expectedOutput: "{'kept_count': 0, 'total_tokens': 0, 'ids': []}",
                testCode: `filter_training_batch([], 0.75)`
              }
            ]
          }
        ]
      }
    }
  },
  'backend-systems-architect': {
    careerTitle: 'Backend Systems Architect',
    description: 'Architect high-throughput distributed services, rate limiters, caching topologies, fault-tolerant queues, and database sharding strategies.',
    levels: [
      {
        id: 1,
        title: 'In-Memory Caching, TTL Expiration & LRU Eviction',
        difficulty: Difficulty.Beginner,
        description: 'Build a deterministic key-value cache that enforces Time-To-Live (TTL) expiration and tracks cache hit ratios.',
        topics: ['Key-Value Lookups', 'TTL Expiration Math', 'Cache Hit vs Miss Metrics', 'Stale Entry Eviction']
      },
      {
        id: 2,
        title: 'Sliding-Window & Token-Bucket Rate Limiters',
        difficulty: Difficulty.Beginner,
        description: 'Protect backend microservices from traffic floods and DDoS bursts with per-client request quotas.',
        topics: ['Token Bucket Algorithm', 'Fixed vs Sliding Windows', 'Retry-After Headers', 'Per-Tenant Quotas']
      },
      {
        id: 3,
        title: 'Consistent Hashing & Load Balancing Topologies',
        difficulty: Difficulty.Intermediate,
        description: 'Route traffic across dynamic server nodes with minimal key redistribution during node scale-up or failure.',
        topics: ['Hash Ring Geometry', 'Virtual Nodes', 'Health Check Probing', 'Least-Connections Routing']
      },
      {
        id: 4,
        title: 'Circuit Breakers, Exponential Backoff & Bulkheads',
        difficulty: Difficulty.Advanced,
        description: 'Stop cascading failures across microservices when downstream dependencies degrade or time out.',
        topics: ['Closed / Open / Half-Open States', 'Exponential Backoff with Jitter', 'Failure Thresholds', 'Fallback Responses']
      },
      {
        id: 5,
        title: 'Distributed Locks, Idempotency & Two-Phase Commit',
        difficulty: Difficulty.Expert,
        description: 'Coordinate concurrent state mutations across replicas without lost updates or split-brain corruption.',
        topics: ['Fencing Tokens', 'Compare-And-Swap (CAS)', 'Outbox Pattern', 'Eventual Consistency']
      }
    ],
    chapterDetails: {
      1: {
        isCached: true,
        teaching: {
          conceptExplanation:
            'Every high-scale backend system relies on caching to keep p99 response latency under 20ms and protect databases from melting under read spikes. However, an unbounded cache without expiration quickly serves stale data or exhausts server RAM.\n\nIn this chapter, you will engineer a deterministic TTL (Time-To-Live) Cache Entry Evaluator that determines whether cached keys are fresh (`HIT`) or expired (`MISS`) at any given timestamp.',
          practicalGuide: 'Study how TTL timestamps are stored and compared against current system time, then pass all 3 unit tests in the IDE.',
          keyTakeaway: 'A cache entry is valid if and only if it exists AND `now < entry.expiresAt`; expired entries must be treated as a cache MISS.',
          sections: [
            {
              title: '1. Cache Hit vs. Cache Miss Mechanics',
              theory:
                'When a service requests a key from a cache layer, three outcomes are possible: the key does not exist (`MISS`), the key exists but its TTL has elapsed (`EXPIRED MISS`), or the key exists and is still within its TTL window (`HIT`).',
              syntaxRule: 'const isHit = Boolean(entry && now < entry.expiresAt);',
              codeLanguage: 'javascript',
              codeExample: `function readCacheEntry(store, key, nowMs) {
  const entry = store[key];
  if (!entry || nowMs >= entry.expiresAt) {
    return { status: 'MISS', value: null };
  }
  return { status: 'HIT', value: entry.value };
}

const cacheStore = {
  'user:42': { value: 'Ada', expiresAt: 5000 }
};

console.log(readCacheEntry(cacheStore, 'user:42', 3000));
console.log(readCacheEntry(cacheStore, 'user:42', 5500));`,
              codeOutput: `{ status: "HIT", value: "Ada" }
{ status: "MISS", value: null }`,
              explanation:
                'At `nowMs = 3000`, the entry is before `expiresAt: 5000` (`HIT`). At `5500`, the TTL has elapsed (`MISS`).'
            },
            {
              title: '2. Computing Hit Ratio Telemetry',
              theory:
                'Systems architects monitor the **Cache Hit Ratio** (`hits / totalRequests`) to tune TTL durations and memory budgets. A production cache typically targets a 85%–98% hit rate.',
              syntaxRule: 'const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;',
              codeLanguage: 'javascript',
              codeExample: `function computeCacheMetrics(hits, misses) {
  const total = hits + misses;
  const hitRatePercent = total > 0 ? Math.round((hits / total) * 100) : 0;
  return { hits, misses, total, hitRatePercent };
}

console.log(computeCacheMetrics(18, 2));`,
              codeOutput: `{ hits: 18, misses: 2, total: 20, hitRatePercent: 90 }`,
              explanation:
                '18 hits out of 20 total lookups yields a `90%` cache hit ratio.'
            },
            {
              title: '3. Batch Lookup Evaluation',
              theory:
                'High-throughput endpoints often perform a `MGET` (multi-get) batch lookup across dozens of keys at once, returning both the resolved values and the batch telemetry.',
              syntaxRule: 'for (const key of keys) { /* evaluate HIT/MISS */ }',
              codeLanguage: 'javascript',
              codeExample: `function evaluateBatchLookup(store, keys, nowMs) {
  let hits = 0;
  let misses = 0;
  const values = [];

  for (const key of keys) {
    const entry = store[key];
    if (entry && nowMs < entry.expiresAt) {
      hits++;
      values.push(entry.value);
    } else {
      misses++;
      values.push(null);
    }
  }

  return { hits, misses, values };
}

const store = {
  k1: { value: 'v1', expiresAt: 2000 },
  k2: { value: 'v2', expiresAt: 1000 }
};
console.log(evaluateBatchLookup(store, ['k1', 'k2', 'k3'], 1500));`,
              codeOutput: `{ hits: 1, misses: 2, values: ["v1", null, null] }`,
              explanation:
                'At `nowMs = 1500`, `k1` is fresh (`HIT`), `k2` expired at `1000` (`MISS`), and `k3` is missing (`MISS`).'
            },
            {
              title: '4. Putting It All Together: TTL Cache Telemetry Engine',
              theory:
                'Combining batch key evaluation with hit-rate percentage calculation gives you a deterministic cache simulator ready for production benchmarking.',
              syntaxRule: 'function simulateCacheBatch(store, keys, nowMs) { ... }',
              codeLanguage: 'javascript',
              codeExample: `function simulateCacheBatch(store, keys, nowMs) {
  let hits = 0;
  let misses = 0;
  const values = [];

  for (const key of keys) {
    const entry = store[key];
    if (entry && nowMs < entry.expiresAt) {
      hits++;
      values.push(entry.value);
    } else {
      misses++;
      values.push(null);
    }
  }

  const total = hits + misses;
  const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;
  return { hits, misses, hitRate, values };
}

console.log(simulateCacheBatch({ a: { value: 10, expiresAt: 500 } }, ['a', 'b'], 250));`,
              codeOutput: `{ hits: 1, misses: 1, hitRate: 50, values: [10, null] }`,
              explanation:
                'Processes any array of lookup keys against the TTL store and computes `hitRate` safely.'
            }
          ],
          pitfalls: [
            {
              mistake: 'Allowing nowMs === entry.expiresAt to count as a HIT',
              whyItHappens: 'Using `nowMs <= entry.expiresAt` instead of strict `<` keeps entries alive 1ms past their expiration boundary.',
              fix: 'Treat `nowMs >= entry.expiresAt` as expired (`MISS`).',
              badCode: `if (entry && nowMs <= entry.expiresAt) { /* HIT */ }`,
              goodCode: `if (entry && nowMs < entry.expiresAt) { /* HIT */ }`
            }
          ]
        },
        resources: [
          {
            title: 'System Design: Caching Strategies, TTL & Eviction Policies',
            type: 'video',
            url: 'https://www.youtube.com/results?search_query=system+design+caching+ttl+lru+explained',
            description: 'Architectural overview of in-memory caching, TTL expiration, and cache hit ratios.',
            source: 'ByteByteGo',
            isVerified: false
          }
        ],
        projects: [
          {
            id: 'be-ch1-ttl-cache',
            title: 'Distributed TTL Cache Batch Evaluator',
            description: 'Implement `simulateCacheBatch(store, keys, nowMs)` to evaluate a batch of cache lookups against TTL timestamps and return `{ hits, misses, hitRate, values }`.',
            difficulty: 'Beginner',
            language: 'javascript',
            requirements: [
              'For each key in `keys`, check if `store[key]` exists AND `nowMs < store[key].expiresAt`.',
              'If fresh, increment `hits` and push `store[key].value` to `values`; otherwise increment `misses` and push `null`.',
              'Compute `hitRate` as `Math.round((hits / total) * 100)` (or `0` if `keys` is empty).',
              'Return `{ hits, misses, hitRate, values }`.'
            ],
            starterCode: `// Assignment: Distributed TTL Cache Batch Evaluator
// Press Run & Test (Cmd/Ctrl + Enter) to verify all unit tests!

function simulateCacheBatch(store, keys, nowMs) {
  let hits = 0;
  let misses = 0;
  const values = [];

  for (const key of keys) {
    const entry = store[key];
    if (entry && nowMs < entry.expiresAt) {
      hits++;
      values.push(entry.value);
    } else {
      misses++;
      values.push(null);
    }
  }

  const total = hits + misses;
  const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;

  return { hits, misses, hitRate, values };
}

console.log(simulateCacheBatch(
  { "session:1": { value: "active", expiresAt: 1000 } },
  ["session:1", "session:2"],
  500
));
`,
            walkthrough: 'Loop through `keys`, check `entry && nowMs < entry.expiresAt`, track `hits`, `misses`, and `values`, and compute `hitRate`.',
            hints: [
              'An entry is a HIT only when `entry && nowMs < entry.expiresAt`.',
              'Push `null` into `values` whenever a key is missing or expired.',
              'Guard against division by zero when `keys.length === 0`.'
            ],
            testCases: [
              {
                id: 'be-tc-1',
                name: 'Distinguishes fresh keys from expired and missing keys',
                inputDescription: 'k1 fresh (exp 2000), k2 expired (exp 1000), k3 missing at nowMs=1500',
                expectedOutput: '{"hits":1,"misses":2,"hitRate":33,"values":["A",null,null]}',
                testCode: `JSON.stringify(simulateCacheBatch({k1:{value:"A",expiresAt:2000},k2:{value:"B",expiresAt:1000}}, ["k1","k2","k3"], 1500))`
              },
              {
                id: 'be-tc-2',
                name: 'Treats exact boundary nowMs === expiresAt as expired MISS',
                inputDescription: 'k1 expiresAt=1000 at nowMs=1000',
                expectedOutput: '{"hits":0,"misses":1,"hitRate":0,"values":[null]}',
                testCode: `JSON.stringify(simulateCacheBatch({k1:{value:"A",expiresAt:1000}}, ["k1"], 1000))`
              },
              {
                id: 'be-tc-3',
                name: 'Handles empty keys list without NaN hitRate',
                inputDescription: 'simulateCacheBatch({}, [], 1000)',
                expectedOutput: '{"hits":0,"misses":0,"hitRate":0,"values":[]}',
                testCode: `JSON.stringify(simulateCacheBatch({}, [], 1000))`
              }
            ]
          }
        ]
      }
    }
  }
};

export const getCuratedRoadmap = (career: string): CareerRoadmap | null => {
  const slug = normalizeCareerSlug(career);
  const blueprint = CURATED_TRACKS[slug];
  if (!blueprint) return null;

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    careerTitle: blueprint.careerTitle,
    description: blueprint.description,
    isCurated: true,
    levels: blueprint.levels.map(lvl => {
      const preloaded = blueprint.chapterDetails[lvl.id];
      return {
        ...lvl,
        ...(preloaded || {}),
        isCached: Boolean(preloaded)
      };
    }),
    extraProjects: []
  };
};

export const getCuratedChapterDetails = (careerTitle: string, levelId: number): Partial<Level> | null => {
  const slug = normalizeCareerSlug(careerTitle);
  const blueprint = CURATED_TRACKS[slug];
  if (!blueprint || !blueprint.chapterDetails[levelId]) return null;
  return {
    ...blueprint.chapterDetails[levelId],
    isCached: true
  };
};
