# Use Apify's Node.js 20 image (required for modern undici/fetch)
FROM apify/actor-node:20

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --omit=optional \
    && npm update \
    && echo "Installed NPM packages:" \
    && npm list --all || true \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# Copy source code
COPY . ./

# Run the actor
CMD ["npm", "start"]
