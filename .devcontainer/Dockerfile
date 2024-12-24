# Use the official Ubuntu base image
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

# Install Python 3 and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    ln -s /usr/bin/python3 /usr/local/bin/python

# Install Node.js (LTS version) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs

# Install global npm packages (optional)
RUN npm install -g yarn

# Set the working directory
WORKDIR /workspace

# Expose the ports for Flask and React
EXPOSE 5000 3000

# Switch back to dialog (non-root) user
USER vscode
