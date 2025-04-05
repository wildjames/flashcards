# Flashcard API

This is a simple backend for serving the flashcard frontend with cards and data. It provides an interface for user registrationa and login, and CRUD endpoints for interacting with flashcards and the groups they are assigned to.

## Features

- User registration and JWT-based authentication.
- CRUD operations for flashcards.
- Group creation and management.
- Users can join groups to access shared flashcards.
- Secure endpoints with JWT authentication.

## TODO:

- [ ] This needs to be served with a proper WSGI thing. Do that
- [ ] Bulk importing needs to be implemented
  - [ ] Google sheets
  - [x] Bulk data from a request
  - [ ] Confluence?
  - [ ] Perhaps given a page, use llm/nlp to parse out q&a? Some existing projects but they seem paid or rubbish so this may be hard

## Getting Started

This project comes with a devcontainer, and that is the recommended way to develop here. However, manual setup is described below.

### Prerequisites

- **Python 3.8+**
- **pip** package manager
- **virtualenv** (recommended)
- **PostgreSQL** (or any SQLAlchemy-supported database)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/wildjames/flashcards.git
   cd flashcard-backend
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

### Configuration

Create a `.env` file in the root directory and set the following environment variables:

```bash
# Secret key for JWT tokens
JWT_SECRET_KEY=very_long_sercret_key_for_jwt

# Token expiration (optional)
JWT_ACCESS_TOKEN_EXPIRES=15  # in minutes
JWT_REFRESH_TOKEN_EXPIRES=30  # in days

# Database URI
DATABASE_ENGINE=mysql+pymysql
DATABASE_USERNAME=flashcards_user
DATABASE_PASSWORD=mypassword
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=flashcards_db
```

**Replace the above with your actual credentials.**

### Database Setup

1. **Initialize the database:**

   Ensure your PostgreSQL server is running and the database specified in `DATABASE_URI` exists.

2. **Apply migrations:**

   ```bash
   make create-db
   make migrate
   ```

### Running the Application

Run the Flask app from the root of the repository with the `Makefile` command,

```bash
make run-backend-dev
```

The application will start on `http://127.0.0.1:5000/`.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens must be included in the `Authorization` header in the format:

```
Authorization: Bearer <access_token>
```

- **Access Token:** Used to authenticate requests to protected endpoints.
- **Refresh Token:** Used to obtain a new access token.

## API Endpoints

### User Endpoints

#### Register

Create a new user account.

- **URL:** `/register`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**

  ```json
  {
    "username": "your_username",
    "email": "your_email",
    "password": "your_password"
  }
  ```

- **Responses:**

  - **201 Created**

    ```json
    {
      "user_id": "uuid"
    }
    ```

  - **400 Bad Request**

    ```json
    {
      "message": "Missing required fields"
    }
    ```

  - **409 Conflict**

    ```json
    {
      "message": "Username or Email already exists"
    }
    ```

#### Login

Authenticate a user and receive JWT tokens.

- **URL:** `/login`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**

  ```json
  {
    "username": "your_username_or_email",
    "password": "your_password"
  }
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "access_token": "your_access_token",
      "refresh_token": "your_refresh_token"
    }
    ```

  - **400 Bad Request**

    ```json
    {
      "message": "Missing required fields"
    }
    ```

  - **401 Unauthorized**

    ```json
    {
      "message": "Invalid credentials"
    }
    ```

#### Refresh Token

Obtain a new access token using a refresh token.

- **URL:** `/refresh`
- **Method:** `POST`
- **Headers:**

  ```
  Authorization: Bearer <refresh_token>
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "access_token": "new_access_token"
    }
    ```

#### Get User Groups

Retrieve groups the authenticated user is subscribed to.

- **URL:** `/user/groups`
- **Method:** `GET`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **Responses:**

  - **200 OK**

    ```json
    [
      {
        "group_name": "Group Name",
        "group_id": "uuid",
        "creator_id": "uuid",
        "time_created": "timestamp",
        "time_updated": "timestamp"
      },
      ...
    ]
    ```

#### Get User Details

Retrieve information about a user

- **URL:** `/user/details`
- **Method:** `GET`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "username": "Username",
      "email": "user@email.com",
      "user_id": "uuid"
    }
    ```

### Card Endpoints

#### Create Card

Create a new flashcard within a group.

- **URL:** `/cards`
- **Method:** `POST`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```

- **Request Body:**

  ```json
  {
    "question": "Flashcard question",
    "correct_answer": "Correct answer",
    "group_id": "uuid"
  }
  ```

- **Responses:**

  - **201 Created**

    ```json
    {
      "card_id": "uuid"
    }
    ```

  - **400 Bad Request**

    ```json
    {
      "message": "Missing required fields"
    }
    ```

  - **403 Forbidden**

    ```json
    {
      "message": "User is not subscribed to the group"
    }
    ```

#### Get Cards

Retrieve all cards from groups the user is subscribed to.

- **URL:** `/cards`
- **Method:** `GET`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "group_id1": [
        {
          "card_id": "uuid",
          "question": "Question text",
          "correct_answer": "Correct answer",
          "group_id": "uuid",
          "creator_id": "uuid",
          "time_created": "timestamp",
          "time_updated": "timestamp",
          "updated_by_id": "uuid"
        },
        ...
      ],
      "group_id2": [
        ...
      ]
    }
    ```

#### Get Card by ID

Retrieve a specific card.

- **URL:** `/cards/<card_id>`
- **Method:** `GET`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **URL Parameters:**

  - `card_id`: UUID of the card

- **Responses:**

  - **200 OK**

    ```json
    {
      "card_id": "uuid",
      "question": "Question text",
      "correct_answer": "Correct answer",
      "group_id": "uuid",
      "creator_id": "uuid",
      "time_created": "timestamp",
      "time_updated": "timestamp",
      "updated_by_id": "uuid"
    }
    ```

  - **403 Forbidden**

    ```json
    {
      "message": "User is not subscribed to the group"
    }
    ```

  - **404 Not Found**

    ```json
    {
      "message": "Card not found"
    }
    ```

#### Update Card

Update an existing card.

- **URL:** `/cards/<card_id>`
- **Method:** `PUT`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```

- **URL Parameters:**

  - `card_id`: UUID of the card

- **Request Body (any of the fields can be updated):**

  ```json
  {
    "question": "Updated question",
    "correct_answer": "Updated answer"
  }
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "message": "Card updated"
    }
    ```

  - **403 Forbidden**

    ```json
    {
      "message": "User is not subscribed to the group"
    }
    ```

  - **404 Not Found**

    ```json
    {
      "message": "Card not found"
    }
    ```

#### Delete Card

Delete a card.

- **URL:** `/cards/<card_id>`
- **Method:** `DELETE`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **URL Parameters:**

  - `card_id`: UUID of the card

- **Responses:**

  - **200 OK**

    ```json
    {
      "message": "Card deleted"
    }
    ```

  - **403 Forbidden**

    ```json
    {
      "message": "User is not subscribed to the group"
    }
    ```

  - **404 Not Found**

    ```json
    {
      "message": "Card not found"
    }
    ```

#### Flashcard

Retrieve a random card, including an incorrect answer. Pulls from all groups subscribed to by the user

- **URL:** `/cards/flashcard`
- **Method:** `GET`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "card_id": "uuid",
      "question": "Question text",
      "correct_answer": "Correct answer",
      "incorrect_answer": "Incorrect answer",
      "group_id": "uuid",
      "creator_id": "uuid",
      "time_created": "timestamp",
      "time_updated": "timestamp",
      "updated_by_id": "uuid"
    }
    ```

### Group Endpoints

#### Create Group

Create a new group.

- **URL:** `/groups`
- **Method:** `POST`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```

- **Request Body:**

  ```json
  {
    "group_name": "Your Group Name"
  }
  ```

- **Responses:**

  - **201 Created**

    ```json
    {
      "group_id": "uuid"
    }
    ```

#### Get Groups

Retrieve all existing groups.

- **URL:** `/groups`
- **Method:** `GET`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **Responses:**

  - **200 OK**

    ```json
    [
      {
        "group_name": "Group Name",
        "group_id": "uuid",
        "creator_id": "uuid",
        "time_created": "timestamp",
        "time_updated": "timestamp",
        "subscribers": ["uuid1", "uuid2", ...]
      },
      ...
    ]
    ```

#### Update Group

Update a group's information.

- **URL:** `/groups/<group_id>`
- **Method:** `PUT`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```

- **URL Parameters:**

  - `group_id`: UUID of the group

- **Request Body:**

  ```json
  {
    "group_name": "Updated Group Name"
  }
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "message": "Group updated"
    }
    ```

  - **403 Forbidden**

    ```json
    {
      "message": "User is not the creator of the group"
    }
    ```

  - **404 Not Found**

    ```json
    {
      "message": "Group not found"
    }
    ```

#### Delete Group

Delete a group.

- **URL:** `/groups/<group_id>`
- **Method:** `DELETE`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **URL Parameters:**

  - `group_id`: UUID of the group

- **Responses:**

  - **200 OK**

    ```json
    {
      "message": "Group deleted"
    }
    ```

  - **403 Forbidden**

    ```json
    {
      "message": "User is not the creator of the group"
    }
    ```

  - **404 Not Found**

    ```json
    {
      "message": "Group not found"
    }
    ```

#### Join Group

Subscribe the authenticated user to a group.

- **URL:** `/groups/<group_id>/join`
- **Method:** `POST`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **URL Parameters:**

  - `group_id`: UUID of the group

- **Responses:**

  - **200 OK**

    ```json
    {
      "message": "User added to group"
    }
    ```

  - **404 Not Found**

    ```json
    {
      "message": "Group not found"
    }
    ```

#### Get group information

#### Get all cards in a group

### Protected Route Example

An example of a protected route that returns a greeting.

- **URL:** `/protected`
- **Method:** `GET`
- **Headers:**

  ```
  Authorization: Bearer <access_token>
  ```

- **Responses:**

  - **200 OK**

    ```json
    {
      "message": "Hello user <user_id>"
    }
    ```

### Development Endpoints

#### Get All Usernames

Retrieve a list of all usernames (for development purposes).

- **URL:** `/dev/users`
- **Method:** `GET`
- **Headers:** None

- **Responses:**

  - **200 OK**

    ```json
    [
      "username1",
      "username2",
      ...
    ]
    ```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of an API request. Error responses include a JSON body with a `message` field:

- **400 Bad Request:** The request is invalid or missing parameters.
- **401 Unauthorized:** Authentication failed or missing.
- **403 Forbidden:** The authenticated user does not have access rights.
- **404 Not Found:** The requested resource does not exist.
- **409 Conflict:** A resource conflict occurred (e.g., duplicate username).

## Examples

Below are examples of how to interact with the API using `curl`.

### Register a New User

```bash
curl -X POST http://127.0.0.1:5000/register \
     -H "Content-Type: application/json" \
     -d '{
           "username": "john_doe",
           "email": "john@example.com",
           "password": "securepassword"
         }'
```

### Login

```bash
curl -X POST http://127.0.0.1:5000/login \
     -H "Content-Type: application/json" \
     -d '{
           "username": "john_doe",
           "password": "securepassword"
         }'
```

### Create a Group

```bash
curl -X POST http://127.0.0.1:5000/groups \
     -H "Authorization: Bearer <access_token>" \
     -H "Content-Type: application/json" \
     -d '{
           "group_name": "Math Flashcards"
         }'
```

### Join a Group

```bash
curl -X POST http://127.0.0.1:5000/groups/<group_id>/join \
     -H "Authorization: Bearer <access_token>"
```

### Create a Card

```bash
curl -X POST http://127.0.0.1:5000/cards \
     -H "Authorization: Bearer <access_token>" \
     -H "Content-Type: application/json" \
     -d '{
           "question": "What is 2+2?",
           "correct_answer": "4",
           "group_id": "<group_id>"
         }'
```

### Get Cards

```bash
curl -X GET http://127.0.0.1:5000/cards \
     -H "Authorization: Bearer <access_token>"
```
