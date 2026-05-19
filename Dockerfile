FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies based on the lockfile
COPY package.json package-lock.json ./
RUN npm ci --only=production --silent

# Copy app source
COPY . .

# Production environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "start"]
# Use official Node.js LTS image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy application source
COPY . ./

# Expose port used by the app
EXPOSE 4000

# Use the start script defined in package.json
CMD ["npm", "start"]
