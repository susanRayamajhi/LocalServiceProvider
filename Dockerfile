FROM node:18-alpine

WORKDIR /usr/src/app

# Install nodemon globally for development
RUN npm install -g nodemon

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Match internal container port
EXPOSE 3000

# Start with nodemon for development
CMD ["nodemon", "app.js"]
