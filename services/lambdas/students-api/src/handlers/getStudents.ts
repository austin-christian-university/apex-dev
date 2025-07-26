import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import type { Student, ApiResponse } from '@acu-apex/types';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = `acu-apex-students-${process.env.STAGE || 'dev'}`;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Set CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Scan DynamoDB table for all students
    const result = await dynamodb.scan({
      TableName: TABLE_NAME
    }).promise();

    const students = result.Items as Student[] || [];

    const response: ApiResponse<Student[]> = {
      data: students
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error fetching students:', error);
    
    const response: ApiResponse<null> = {
      error: 'Failed to fetch students'
    };

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
  }
}; 