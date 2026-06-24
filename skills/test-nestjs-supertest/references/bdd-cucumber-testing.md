# BDD: Creating a Cucumber Test with Gherkin

## 1. Writing a Feature File (Gherkin)

Feature files are written in Gherkin syntax. Place them in the `features/` folder.

**Example:** `features/posts.feature`

```gherkin
Feature: Manage Posts on JSONPlaceholder API

  Scenario: Retrieve a list of posts
    Given I am a user
    When I send a GET request to /posts
    Then the API should respond with status code 200
    And the response should contain an array of posts

  Scenario: Create a new post
    Given I am a user
    When I send a POST request to /posts
    Then the API should respond with status code 201
    And the response should contain the post object

  Scenario: Retrieve a specific post
    Given I am a user
    When I send a GET request to /posts/1
    Then the API should respond with status code 200
    And the response should contain the details of the post
```

## 2. Implementing Step Definitions

Step definitions connect Gherkin steps to executable code. They are placed in `features/support/steps.ts`.

```typescript
const { Given, When, Then } = require('@cucumber/cucumber');
const supertest = require('supertest');
const assert = require('assert');

const request = supertest('https://jsonplaceholder.typicode.com');

const PostData = {
  title: 'title of post',
  body: 'body of post',
  userId: 1
};

Given('I am a user', () => {
  // No-op: context is set
});

When('I send a GET request to /posts', async function () {
  this.response = await request.get('/posts');
});

When('I send a GET request to /posts/{int}', async function (postId: number) {
  this.response = await request.get(`/posts/${postId}`);
});

When('I send a POST request to /posts', async function () {
  this.response = await request.post('/posts').send(PostData);
});

Then('the API should respond with status code 200', async function () {
  assert.equal(this.response.status, 200);
});

Then('the API should respond with status code 201', async function () {
  assert.equal(this.response.status, 201);
});

Then('the response should contain an array of posts', async function () {
  assert.ok(Array.isArray(this.response.body));
});

Then('the response should contain the post object', async function () {
  assert.ok(this.response.body.id);
  assert.equal(this.response.body.title, PostData.title);
});

Then('the response should contain the details of the post', async function () {
  assert.ok(this.response.body.id);
});
```

### Important Notes:
- **Context sharing**: The `this` object is shared across steps within a scenario. Store responses, IDs, etc., in `this` (e.g., `this.response`).
- **Async/Await**: All steps must be async and return a Promise. Cucumber waits for them to resolve.
- **Parameter types**: Use `{int}`, `{string}`, `{float}` to pass parameters into steps.

## 2b. Step Definitions against a NestJS app (recommended)

When integrating with a real `INestApplication` (see Part 1b in
`cucumber-integration.md`), the steps fire requests at `app.getHttpServer()`
via the typed `CustomWorld`, instead of a hard-coded external URL.

**Feature:** `test/bdd/features/hello.feature`

```gherkin
Feature: Hello endpoint
  As an API consumer
  I want to call the root endpoint
  So that I receive a greeting

  Scenario: Get the hello world greeting
    Given the API is running
    When I send a GET request to "/"
    Then the response status should be 200
    And the response body should be "Hello World!"
```

**Steps:** `test/bdd/steps_definition/hello.steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import request from 'supertest';
// steps_definition/ and support/ are siblings in the flat layout
import { CustomWorld } from '../support/world';

Given('the API is running', function (this: CustomWorld) {
  assert.ok(this.app, 'Nest application should be initialized');
});

When(
  'I send a GET request to {string}',
  async function (this: CustomWorld, path: string) {
    this.response = await request(this.app.getHttpServer()).get(path);
  },
);

Then(
  'the response status should be {int}',
  function (this: CustomWorld, status: number) {
    assert.equal(this.response.status, status);
  },
);

Then(
  'the response body should be {string}',
  function (this: CustomWorld, body: string) {
    assert.equal(this.response.text, body);
  },
);
```

> Use `import request from 'supertest'` (default import) — it works because
> `esModuleInterop` is enabled in the CommonJS tsconfig from Part 1b. For a
> JSON endpoint assert against `this.response.body` instead of `.text`.

## 3. Running Cucumber Tests

```bash
# Run all features
npm run test:cucumber

# Run a specific feature file
npx cucumber-js features/posts.feature

# Run with custom tags (if you add @smoke, @regression, etc.)
npx cucumber-js --tags "@smoke"
```

## 4. Step Parameters and Custom Types

You can define custom parameter types to parse more complex inputs. Example:

```typescript
import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'user',
  regexp: /"([^"]*)"/,
  transformer: (name) => ({ name }),
});
```

Then use it in steps:

```gherkin
Given I am a user "Alice"
```

And in step definition:

```typescript
Given('I am a user {user}', async function (user: { name: string }) {
  this.user = user;
});
```

## 5. Quick Command Reference

| Command | Description |
|---------|-------------|
| `npm run test:supertest` | Run SuperTest + Jest tests |
| `npm run test:cucumber` | Run all Cucumber features |
| `npm run test` | Run both SuperTest and Cucumber |
| `npx cucumber-js features/posts.feature` | Run a single feature file |
| `npx cucumber-js --tags "@smoke"` | Run features with specific tags |

---

## Resources

- [Original article on Medium](https://medium.com/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1)
- [Example repository](https://github.com/tooniez/supertest-cucumber-ts)
- [Cucumber.js documentation](https://github.com/cucumber/cucumber-js)
