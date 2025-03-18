# Use an official Nginx runtime as the base image
FROM nginx:alpine

# Copy the production build to the Nginx html directory
COPY dist /usr/share/nginx/html

# Copy the Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]