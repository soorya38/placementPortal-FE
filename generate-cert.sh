#!/bin/bash

# Create .cert directory if it doesn't exist
mkdir -p .cert

# Generate SSL certificate
openssl req -x509 -newkey rsa:2048 -keyout .cert/key.pem -out .cert/cert.pem -days 365 -nodes -subj "/CN=localhost"

# Set proper permissions
chmod 600 .cert/key.pem
chmod 600 .cert/cert.pem 