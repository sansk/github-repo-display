FROM node:20-alpine

LABEL "com.github.actions.name"="Github Repo Display in README"
LABEL "com.github.actions.description"="Update your profile README with repositories that have the specified topic/tag"
LABEL "com.github.actions.icon"="star"
LABEL "com.github.actions.color"="blue"

LABEL "repository"="https://github.com/sansk/github-repo-display"
LABEL "homepage"="https://github.com/sansk/github-repo-display#readme"
LABEL "maintainer"="sansk <sangeetha.csk@gmail.com>"

# Install dependencies
RUN apk add --no-cache git

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Set the entrypoint
ENTRYPOINT ["node", "/app/dist/index.js"]