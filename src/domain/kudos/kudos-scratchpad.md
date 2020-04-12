```graphql
{
  kudos {
    id
    message
    date
    userFrom {
      username
      name
    }
    userTo {
      username
      name
    }
  }
}
```

```json
{
  "id": "123",
  "description": "awesome person",
  "date": "04-10-2020",
  "userTo": {
    "username": "cumbreras",
    "name": "edgar cumbreras"
  },
  "userFrom": {
    "username": "mikeplatinas",
    "name": "mike platinas"
  }
}
```
