# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install static server
RUN npm i -g serve

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose the port
EXPOSE 5471

# Start the built app
CMD ["serve", "-s", "dist", "-l", "5471"]
