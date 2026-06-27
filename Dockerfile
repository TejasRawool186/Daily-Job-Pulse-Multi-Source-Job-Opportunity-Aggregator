# Use Apify's Node.js 22 LTS image
FROM apify/actor-node:22

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install production dependencies only, clean cache
RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && rm -rf ~/.npm

# Copy source code
COPY . ./

# Run the actor
CMD npm start --silent
