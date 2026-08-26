# Test Cases: DemoQA Book Store Application

Priority is based on functional importance, test dependencies, state complexity, and defect-detection value. Cases are listed roughly in priority order; later additions are appended at the end.

## TC-01: Display book catalog records

- Priority: High
- Type: Positive
- Preconditions: The Book Store page is available.

**Given** a logged-out user opens the Book Store page \
**When** the catalog finishes loading \
**Then** at least one book is displayed \
**And** each displayed record contains a title, author, and publisher \
**And** each title opens the corresponding book details.

## TC-02: Search by case-insensitive partial title or author

- Priority: High
- Type: Positive
- Preconditions: The catalog contains known books.

**Given** the user is on the Book Store page \
**When** the user searches with a mixed-case part of a known title \
**Then** every displayed result contains that text in its title, ignoring case \
**When** the user searches with part of a known author name \
**Then** every displayed result contains that text in its author, ignoring case \
**And** unrelated books are not displayed.

## TC-03: Keep catalog and book-detail information consistent

- Priority: High
- Type: Positive
- Preconditions: A known book is visible in the catalog.

**Given** the user records a book's title, author, and publisher from the catalog \
**When** the user opens that book \
**Then** the detail page shows the same title, author, and publisher \
**And** the displayed ISBN identifies the selected book \
**And** the page includes the book's additional details.

## TC-04: Register a new user

- Priority: High
- Type: Positive and negative
- Preconditions: The chosen username does not already exist.

**Given** a user opens the registration page \
**When** the user submits the form with empty fields \
**Then** all required fields are identified \
**And** no account is created.

**Given** the user enters valid names and a unique username \
**But** enters a password that does not meet the password rules \
**When** the user submits the registration form \
**Then** the password is rejected with a clear explanation \
**And** no account is created.

**Given** the user enters valid unique account details \
**When** the user submits the registration form \
**Then** the account is created \
**And** the user can return to Login and authenticate with the new credentials.

### Cleanup

The account created by this test is deleted through the API after the login check.

## TC-05: Reject missing fields and invalid login credentials

- Priority: High
- Type: Negative
- Preconditions: The user is logged out and is on the Login page.

**Given** the username and password fields are empty \
**When** the user submits the form \
**Then** both required fields are identified clearly \
**And** the user remains logged out.

**Given** only one required field has a value \
**When** the user submits the form \
**Then** the missing field is identified clearly \
**And** the user remains logged out.

**Given** the user enters an invalid username and password \
**When** the user submits the form \
**Then** an invalid-credentials message is displayed \
**And** the user remains on the Login page \
**And** authenticated profile controls are not available.

## TC-06: Add, persist, and remove a book from a collection

- Priority: High
- Type: Positive
- Preconditions: A disposable user is available or created for the test and does not already have the selected book.

**Given** the disposable user logs in successfully \
**And** the selected book is not in the user's collection \
**When** the user adds the book from its detail page \
**Then** the application confirms that the book was added \
**And** the book appears in the user's profile \
**And** the book remains in the collection after a full page reload \
**When** the user deletes that book and confirms the action \
**Then** the application confirms that the book was deleted \
**And** the book is absent from the profile \
**And** the book remains absent after a full page reload.

### Cleanup

If this test fails after adding the book, cleanup must still run. It must remove only data created by the test. A pre-existing account must not be deleted; an account created by automation must be deleted during teardown.

## TC-07: Prevent a logged-out user from adding a book

- Priority: Medium
- Type: Negative
- Preconditions: The user is logged out and a known book exists in the catalog.

**Given** a logged-out user opens a book's detail page \
**When** the page finishes loading \
**Then** the user cannot add the book to a collection \
**And** the page offers a way to log in \
**And** no collection data is changed.

## TC-08: Handle empty, whitespace, and unknown searches

- Priority: Medium
- Type: Negative
- Preconditions: The user is on the Book Store page and the catalog is loaded.

**Given** the complete catalog is displayed \
**When** the search field is empty or cleared \
**Then** the complete catalog remains displayed.

**Given** the complete catalog is displayed \
**When** the user searches for a value that matches no title or author \
**Then** no book rows are displayed \
**And** pagination controls are disabled \
**And** the page does not show an invalid page count.

**Given** a search value has surrounding whitespace \
**When** the user submits the search \
**Then** the surrounding whitespace is ignored \
**And** the result is the same as searching for the trimmed value.

## TC-09: Return from details to a consistent catalog

- Priority: Medium
- Type: Edge
- Preconditions: A search filter has reduced the catalog to one or more books.

**Given** the user opens a book from filtered search results \
**When** the user selects Back To Book Store \
**Then** the catalog and search field represent the same state \
**And** either the previous filter and its results are restored or both are reset \
**And** the user does not see filtered results with an empty search field.

## TC-10: Sort the catalog by title

- Priority: Low
- Type: Positive
- Preconditions: The catalog contains multiple books.

**Given** the user is on the Book Store page \
**When** the user selects the Title column once \
**Then** the books are ordered by title in ascending order \
**When** the user selects the Title column again \
**Then** the books are ordered by title in descending order \
**And** the displayed sort direction matches the actual order.

## TC-11: Prevent adding the same book twice

- Priority: High
- Type: Negative
- Preconditions: A disposable user is logged in and already owns the selected book.

**Given** the user opens a book that is already in the collection \
**When** the user adds the book again \
**Then** the application reports that the book is already in the collection \
**And** the collection still contains exactly one copy of the book.

## TC-12: Cancel book deletion

- Priority: Medium
- Type: Positive
- Preconditions: A disposable user is logged in and owns at least one book.

**Given** the user starts deleting a book from Profile \
**When** the user cancels the deletion in the confirmation dialog \
**Then** the dialog closes \
**And** the book remains in the collection \
**And** the book remains after a full page reload.

### Cleanup

The disposable account is removed during teardown, which also removes the added book.
