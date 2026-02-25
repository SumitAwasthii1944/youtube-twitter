class ApiResponse {// This class is designed to standardize the structure of API responses in a consistent format. It includes properties such as statusCode, data, message, and success to provide a clear and uniform response structure for API endpoints.
          constructor(statusCode, data,message="Success") {
                    this.statusCode = statusCode
                    this.data = data
                    this.message = message
                    this.success = statusCode < 400
          }
}

export {ApiResponse}