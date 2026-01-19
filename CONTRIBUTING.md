# Contributing to RustFS Manager

First off, thank you for considering contributing to RustFS Manager! It's people like you that make RustFS Manager such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, Docker version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List any similar features in other applications**

### Pull Requests

* Fill in the required template
* Follow the coding style guidelines
* Include appropriate test cases
* Update documentation as needed
* End all files with a newline

## Development Setup

### Prerequisites

* Go 1.23 or higher
* Node.js 18 or higher
* Docker and Docker Compose
* Git

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/rustfs-manager.git
   cd rustfs-manager
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/rustfs-manager.git
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. **Start development environment**
   ```bash
   docker-compose up -d
   ```

### Backend Development

```bash
cd backend

# Install dependencies
go mod download

# Run tests
go test ./...

# Run locally (without Docker)
go run main.go

# Build
go build -o main .
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint
npm run lint
```

## Coding Style Guidelines

### Go (Backend)

* Follow [Effective Go](https://golang.org/doc/effective_go.html)
* Use `gofmt` to format your code
* Use meaningful variable and function names
* Add comments for exported functions and types
* Keep functions small and focused
* Handle errors explicitly

Example:
```go
// GetUserByID retrieves a user by their ID
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
    user, err := s.repo.FindByID(id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)
    }
    return user, nil
}
```

### TypeScript/React (Frontend)

* Use TypeScript for all new code
* Follow React best practices and hooks patterns
* Use functional components
* Use meaningful component and variable names
* Keep components small and focused
* Use proper TypeScript types (avoid `any`)

Example:
```typescript
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export default function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user)}>Edit</button>
    </div>
  );
}
```

### General Guidelines

* Write clear, self-documenting code
* Add comments for complex logic
* Keep lines under 100 characters when possible
* Use consistent indentation (2 spaces for JS/TS, tabs for Go)
* Remove unused imports and variables
* No console.logs in production code

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that don't affect code meaning (formatting, etc.)
* **refactor**: Code change that neither fixes a bug nor adds a feature
* **perf**: Performance improvement
* **test**: Adding or updating tests
* **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(backup): add PostgreSQL instant backup feature

Implemented instant backup functionality for PostgreSQL databases
with options to download locally or upload to VPS.

Closes #123
```

```
fix(auth): resolve JWT token expiration issue

Fixed bug where JWT tokens were expiring too quickly due to
incorrect time calculation.

Fixes #456
```

## Testing

### Backend Tests

```bash
cd backend
go test ./...

# With coverage
go test -cover ./...

# Specific package
go test ./internal/services
```

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Documentation

* Update README.md if you change functionality
* Update API documentation for new endpoints
* Add JSDoc comments for complex functions
* Update DEPLOYMENT_GUIDE.md for deployment changes

## Pull Request Process

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes**
   * Write clean, documented code
   * Add tests for new features
   * Ensure all tests pass
   * Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   * Go to GitHub and create a PR
   * Fill in the PR template
   * Link related issues
   * Request review from maintainers

6. **Address review feedback**
   * Make requested changes
   * Push updates to your branch
   * Respond to comments

7. **Merge**
   * Once approved, a maintainer will merge your PR
   * Delete your feature branch after merge

## Project Structure

```
rustfs-manager/
├── backend/              # Go backend
│   ├── internal/
│   │   ├── handlers/    # HTTP handlers
│   │   ├── services/    # Business logic
│   │   ├── models/      # Data models
│   │   ├── repository/  # Database layer
│   │   └── dto/         # Data transfer objects
│   ├── main.go          # Entry point
│   └── go.mod
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   └── services/   # API services
│   └── package.json
├── database/            # Database migrations
├── nginx/              # Nginx configuration
└── docker-compose.yml  # Docker setup
```

## Getting Help

* **Documentation**: Check README.md and DEPLOYMENT_GUIDE.md
* **Issues**: Search existing issues or create a new one
* **Discussions**: Use GitHub Discussions for questions
* **Discord**: Join our community Discord (link in README)

## Recognition

Contributors will be recognized in:
* README.md contributors section
* Release notes
* Project website (when available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to RustFS Manager! 🎉
