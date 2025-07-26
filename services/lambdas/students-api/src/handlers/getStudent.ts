import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import type { Student, ApiResponse } from '@acu-apex/types';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = `acu-apex-students-${process.env.STAGE || 'dev'}`;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    const { id } = event.pathParameters || {};

    if (!id) {
      const response: ApiResponse<null> = {
        error: 'Student ID is required'
      };

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(response)
      };
    }

    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id }
    }).promise();

    if (!result.Item) {
      const response: ApiResponse<null> = {
        error: 'Student not found'
      };

      return {
        statusCode: 404,
        headers,
        body: JSON.stringify(response)
      };
    }

    const student = result.Item as Student;
    const response: ApiResponse<Student> = {
      data: student
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error fetching student:', error);
    
    const response: ApiResponse<null> = {
      error: 'Failed to fetch student'
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