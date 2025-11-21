#!/bin/bash

# Mind Controll Startup Script
echo "Starting Mind Controll..."
echo ""

# Set Java 21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Check if Java 21 is available
if [ $? -ne 0 ]; then
    echo "ERROR: Java 21 is required but not found!"
    echo "Please install Java 21 (OpenJDK or Amazon Corretto)"
    exit 1
fi

echo "Using Java: $(java --version | head -1)"
echo ""

# Run the application
mvn spring-boot:run
