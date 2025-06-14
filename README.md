# MMquiz

A RESTful API for creating and managing tournament-style quiz games with bracket-based elimination system.

## Features

- **User Authentication**: Basic auth for public endpoints, JWT for user-specific operations
- **Game Management**: Create, update, and manage quiz games with visibility controls
- **Selection Management**: Add and manage choices for your games
- **Tournament System**: Run elimination-style tournaments with configurable rounds

## Requirements

- Node.js 18+
- PostgreSQL 12+

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file from example:

```bash
cp .env.example .env
```

3. Configure environment variables

4. Import SQL file to your PostgreSQL database

5. Start the application:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Documentation

API documentation is available at [Postman](https://documenter.getpostman.com/view/10662426/2sB2x2KZrP)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.