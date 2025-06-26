export const toolSchemas = {
  read_file: {
    type: 'object',
    properties: {
      filepath: {
        type: 'string',
        description: 'Path to the file to read'
      }
    },
    required: ['filepath']
  },
  
  write_file: {
    type: 'object',
    properties: {
      filepath: {
        type: 'string',
        description: 'Path to the file to write'
      },
      content: {
        type: 'string',
        description: 'Content to write to the file'
      },
      create_dirs: {
        type: 'boolean',
        description: 'Create parent directories if they don\'t exist',
        default: true
      }
    },
    required: ['filepath', 'content']
  },
  
  list_directory: {
    type: 'object',
    properties: {
      dirpath: {
        type: 'string',
        description: 'Path to the directory to list'
      },
      recursive: {
        type: 'boolean',
        description: 'List recursively',
        default: false
      }
    },
    required: ['dirpath']
  },
  
  web_search: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of results to return',
        default: 5
      }
    },
    required: ['query']
  },
  
  web_fetch: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to fetch content from'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds',
        default: 10000
      }
    },
    required: ['url']
  },
  
  shell_command: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'Shell command to execute'
      },
      cwd: {
        type: 'string',
        description: 'Working directory'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds',
        default: 30000
      }
    },
    required: ['command']
  },
  
  node_script: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'JavaScript/Node.js code to execute'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds',
        default: 30000
      }
    },
    required: ['code']
  },
  
  http_request: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to make request to'
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        description: 'HTTP method',
        default: 'GET'
      },
      headers: {
        type: 'object',
        description: 'Request headers'
      },
      body: {
        type: 'string',
        description: 'Request body'
      }
    },
    required: ['url']
  }
};