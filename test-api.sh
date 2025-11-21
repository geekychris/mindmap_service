#!/bin/bash

# Mind Controll API Test Script
# This script tests the REST API endpoints using curl

BASE_URL="http://localhost:8080/api/v1"

echo "====================================="
echo "Mind Controll API Test Script"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Function to make GET request
test_get() {
    echo -e "${BLUE}GET${NC} $1"
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$1")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$2" ]; then
        print_result 0 "Expected status $2, got $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_result 1 "Expected status $2, got $http_code"
        echo "$body"
    fi
    echo ""
}

# Function to make POST request
test_post() {
    echo -e "${BLUE}POST${NC} $1"
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$1" \
        -H "Content-Type: application/json" \
        -d "$2")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$3" ]; then
        print_result 0 "Expected status $3, got $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_result 1 "Expected status $3, got $http_code"
        echo "$body"
    fi
    echo ""
    echo "$body"
}

# Function to make PUT request
test_put() {
    echo -e "${BLUE}PUT${NC} $1"
    response=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL$1" \
        -H "Content-Type: application/json" \
        -d "$2")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$3" ]; then
        print_result 0 "Expected status $3, got $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_result 1 "Expected status $3, got $http_code"
        echo "$body"
    fi
    echo ""
}

# Function to make DELETE request
test_delete() {
    echo -e "${BLUE}DELETE${NC} $1"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$1")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "$2" ]; then
        print_result 0 "Expected status $2, got $http_code"
    else
        print_result 1 "Expected status $2, got $http_code"
    fi
    echo ""
}

echo "Checking if API is running..."
if ! curl -s -f "$BASE_URL/mindmaps?size=1" > /dev/null; then
    echo -e "${RED}ERROR${NC}: API is not running at $BASE_URL"
    echo "Please start the application first with: ./run.sh"
    exit 1
fi
echo -e "${GREEN}API is running!${NC}"
echo ""

# ===================================
# Test 1: Create a User (via direct insert for demo)
# ===================================
echo "====================================="
echo "Test 1: User Management"
echo "====================================="
echo "Note: In demo mode, users are auto-created"
echo "Users: alice, bob, charlie"
echo ""

# Get a user ID (assuming demo data is loaded)
USERS_RESPONSE=$(curl -s "$BASE_URL/mindmaps?size=1")
OWNER_ID=$(echo "$USERS_RESPONSE" | jq -r '.content[0].owner.id' 2>/dev/null)

if [ "$OWNER_ID" = "null" ] || [ -z "$OWNER_ID" ]; then
    echo "Warning: No demo data found. Using hardcoded test user."
    OWNER_ID="test-user-id"
fi

echo "Using owner ID: $OWNER_ID"
echo ""

# ===================================
# Test 2: Mind Map CRUD Operations
# ===================================
echo "====================================="
echo "Test 2: Mind Map CRUD Operations"
echo "====================================="

# Create a mind map
echo "Creating a new mind map..."
CREATE_DATA='{
  "name": "Test API Mind Map",
  "description": "Created via API test script",
  "ownerId": "'$OWNER_ID'"
}'

CREATE_RESPONSE=$(test_post "/mindmaps" "$CREATE_DATA" "201")
MINDMAP_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ "$MINDMAP_ID" = "null" ] || [ -z "$MINDMAP_ID" ]; then
    echo "Failed to create mind map. Using existing one..."
    MINDMAP_ID=$(curl -s "$BASE_URL/mindmaps?size=1" | jq -r '.content[0].id' 2>/dev/null)
fi

echo "Mind Map ID: $MINDMAP_ID"
echo ""

# Get the mind map
echo "Fetching the mind map..."
test_get "/mindmaps/$MINDMAP_ID" "200"

# Update the mind map
echo "Updating the mind map..."
UPDATE_DATA='{
  "name": "Updated Test Mind Map",
  "description": "Updated via API test script"
}'
test_put "/mindmaps/$MINDMAP_ID" "$UPDATE_DATA" "200"

# Get all mind maps
echo "Fetching all mind maps..."
test_get "/mindmaps" "200"

# Get mind maps with pagination
echo "Fetching mind maps with pagination (page=0, size=2)..."
test_get "/mindmaps?page=0&size=2" "200"

# Get mind maps with sorting
echo "Fetching mind maps sorted by name..."
test_get "/mindmaps?sort=name,asc" "200"

# ===================================
# Test 3: Filtering
# ===================================
echo "====================================="
echo "Test 3: Filtering Operations"
echo "====================================="

echo "Filtering mind maps by owner..."
test_get "/mindmaps?owner=$OWNER_ID" "200"

# ===================================
# Test 4: Error Handling
# ===================================
echo "====================================="
echo "Test 4: Error Handling"
echo "====================================="

echo "Getting non-existent mind map (should return 404)..."
test_get "/mindmaps/non-existent-id" "404"

echo "Creating mind map with missing required fields (should return 400)..."
INVALID_DATA='{
  "description": "Missing name and ownerId"
}'
test_post "/mindmaps" "$INVALID_DATA" "400"

# ===================================
# Test 5: Delete Operation
# ===================================
echo "====================================="
echo "Test 5: Delete Operation"
echo "====================================="

echo "Creating a mind map to delete..."
DELETE_CREATE_DATA='{
  "name": "Mind Map to Delete",
  "ownerId": "'$OWNER_ID'"
}'
DELETE_RESPONSE=$(test_post "/mindmaps" "$DELETE_CREATE_DATA" "201")
DELETE_MINDMAP_ID=$(echo "$DELETE_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ "$DELETE_MINDMAP_ID" != "null" ] && [ -n "$DELETE_MINDMAP_ID" ]; then
    echo "Deleting the mind map..."
    test_delete "/mindmaps/$DELETE_MINDMAP_ID" "204"
    
    echo "Verifying deletion (should return 404)..."
    test_get "/mindmaps/$DELETE_MINDMAP_ID" "404"
fi

# ===================================
# Test 6: Swagger UI Check
# ===================================
echo "====================================="
echo "Test 6: Swagger UI Availability"
echo "====================================="

echo "Checking Swagger UI..."
if curl -s -f "$BASE_URL/swagger-ui.html" > /dev/null; then
    print_result 0 "Swagger UI is accessible"
else
    print_result 1 "Swagger UI is not accessible"
fi
echo ""

# ===================================
# Summary
# ===================================
echo "====================================="
echo "Test Summary"
echo "====================================="
echo "API Base URL: $BASE_URL"
echo "Swagger UI: $BASE_URL/swagger-ui.html"
echo "H2 Console: $BASE_URL/h2-console"
echo ""
echo "All tests completed!"
echo "For more interactive testing, visit the Swagger UI in your browser."
