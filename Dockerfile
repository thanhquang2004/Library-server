FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your Express app listens on (e.g., 5000)
EXPOSE 5000

# Define the command to run your application when the container starts
CMD ["node", "server.js"]