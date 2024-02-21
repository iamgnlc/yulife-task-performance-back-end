# Fixes

- make use of env vars to avoid hardcoding secrets in code.
- `.env` file should not be committed to the repo (I committed just as this is a test).
- changed some config as struggling to run it locally (docker migrate, develop script).
- Changed port as 5000 was in use locally.
- Fixed artillery index.js.
- moved types deps into devDependencies to reduce bundel size.
- Using `"instances": "MAX",` in PM2 condfiguration will spawn an app process for each available core.

## Recommendations

- disable schema introspection in prod to mitigate malicius actors attacks.
- Implement CSRF protection mechanisms to prevent an attacker tricking a user into making unintended requests.
- Sanitize user inputs if needed.
- jwt valid for 1 year maybe is too long.
- Avoid console.log in prod.
- config could be refqacotred to obtain all values via env vars to avoid having multiple config files per environment.
- Refactor (where possible) async/await with Promises.all to improve performance.

## GQL

```graphql
mutation register {
  register(email: "test6@test.com", password: "test")
}

mutation login {
  login(email: "test2@test.com", password: "test")
}

mutation sendRandomMessage {
  sendRandomMessage(message: "test2") {
    id
    contents
    to {
      id
      email
      name
    }
    from {
      id
      email
      name
    }
  }
}

mutation markAsRead {
  markAsRead(messageId:"65d61c36b200dbc8c9b8b3c8")
}

query me {
  me {
    id
    name
    email
    unreadMessageCount
    inbox {
      id
      contents
      unread
      to {
        name
        email
      }
      from {
        name
        email
      }
    }
  }
}
```

## Issue encountered

- DB seed didn't work.
- Not familiar with type-graphql library, never used before.
- Not familiar with artillery output.
