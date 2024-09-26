# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the application port (adjust this if your NestJS app uses a different port)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
