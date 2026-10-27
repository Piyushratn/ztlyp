FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Start the Vite server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]