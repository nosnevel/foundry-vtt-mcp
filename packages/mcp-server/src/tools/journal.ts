import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface JournalToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class JournalTools {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: JournalToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'JournalTools' });
  }

  /**
   * Tool definitions for journal operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'create-journal-entry',
        description: 'Create a new journal entry with HTML content',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name/title of the journal entry'
            },
            content: {
              type: 'string',
              description: 'HTML content for the journal entry'
            },
            folder: {
              type: 'string',
              description: 'Optional folder ID or name to organize the journal'
            },
            img: {
              type: 'string',
              description: 'Optional image path for the journal entry'
            }
          },
          required: ['name', 'content']
        }
      },
      {
        name: 'update-journal-entry',
        description: 'Update an existing journal entry\'s content, name, or other properties',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'ID of the journal entry to update (or name to search for)'
            },
            updates: {
              type: 'object',
              description: 'Properties to update',
              properties: {
                name: {
                  type: 'string',
                  description: 'New name for the journal'
                },
                content: {
                  type: 'string',
                  description: 'New HTML content (updates first page)'
                },
                pageId: {
                  type: 'string',
                  description: 'Specific page ID to update (optional, defaults to first page)'
                },
                img: {
                  type: 'string',
                  description: 'New image path'
                },
                folder: {
                  type: 'string',
                  description: 'New folder name or ID'
                }
              }
            }
          },
          required: ['journalId', 'updates']
        }
      },
      {
        name: 'delete-journal-entry',
        description: 'Delete a journal entry by ID or name',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'ID or name of the journal entry to delete'
            },
            confirmDeletion: {
              type: 'boolean',
              description: 'Confirmation required to prevent accidental deletion',
              default: false
            }
          },
          required: ['journalId', 'confirmDeletion']
        }
      },
      {
        name: 'add-journal-page',
        description: 'Add a new page to an existing journal entry',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'ID or name of the journal entry'
            },
            pageName: {
              type: 'string',
              description: 'Name of the new page'
            },
            content: {
              type: 'string',
              description: 'HTML content for the page'
            },
            pageType: {
              type: 'string',
              enum: ['text', 'image', 'pdf', 'video'],
              description: 'Type of page (default: text)',
              default: 'text'
            },
            sort: {
              type: 'number',
              description: 'Sort order for the page (optional)'
            }
          },
          required: ['journalId', 'pageName', 'content']
        }
      },
      {
        name: 'get-journal-entry',
        description: 'Get detailed information about a specific journal entry including all pages',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'ID or name of the journal entry'
            },
            includeContent: {
              type: 'boolean',
              description: 'Whether to include full page content (can be large)',
              default: false
            }
          },
          required: ['journalId']
        }
      },
      {
        name: 'update-journal-page',
        description: 'Update a specific page within a journal entry',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'ID or name of the journal entry'
            },
            pageId: {
              type: 'string',
              description: 'ID or name of the page to update'
            },
            updates: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'New page name'
                },
                content: {
                  type: 'string',
                  description: 'New HTML content'
                },
                sort: {
                  type: 'number',
                  description: 'New sort order'
                }
              }
            }
          },
          required: ['journalId', 'pageId', 'updates']
        }
      },
      {
        name: 'delete-journal-page',
        description: 'Delete a specific page from a journal entry',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'ID or name of the journal entry'
            },
            pageId: {
              type: 'string',
              description: 'ID or name of the page to delete'
            },
            confirmDeletion: {
              type: 'boolean',
              description: 'Confirmation required to prevent accidental deletion',
              default: false
            }
          },
          required: ['journalId', 'pageId', 'confirmDeletion']
        }
      }
    ];
  }

  async handleCreateJournalEntry(args: any): Promise<any> {
    const schema = z.object({
      name: z.string(),
      content: z.string(),
      folder: z.string().optional(),
      img: z.string().optional()
    });

    const { name, content, folder, img } = schema.parse(args);

    this.logger.info('Creating journal entry', { name, folder, hasImage: !!img });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.createJournalEntry', {
        name,
        content,
        folder,
        img
      });

      this.logger.debug('Successfully created journal entry', {
        journalId: result.journalId,
        journalName: result.journalName
      });

      return {
        success: true,
        journalId: result.journalId,
        journalName: result.journalName,
        message: `Successfully created journal entry: ${result.journalName}`
      };

    } catch (error) {
      this.logger.error('Failed to create journal entry', error);
      throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleUpdateJournalEntry(args: any): Promise<any> {
    const schema = z.object({
      journalId: z.string(),
      updates: z.object({
        name: z.string().optional(),
        content: z.string().optional(),
        pageId: z.string().optional(),
        img: z.string().optional(),
        folder: z.string().optional()
      })
    });

    const { journalId, updates } = schema.parse(args);

    this.logger.info('Updating journal entry', { journalId, updates: Object.keys(updates) });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.updateJournalEntry', {
        journalId,
        updates
      });

      this.logger.debug('Successfully updated journal entry', {
        journalId: result.journalId,
        journalName: result.journalName
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to update journal entry', error);
      throw new Error(`Failed to update journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleDeleteJournalEntry(args: any): Promise<any> {
    const schema = z.object({
      journalId: z.string(),
      confirmDeletion: z.boolean().default(false)
    });

    const { journalId, confirmDeletion } = schema.parse(args);

    if (!confirmDeletion) {
      throw new Error('Deletion not confirmed. Set confirmDeletion to true.');
    }

    this.logger.info('Deleting journal entry', { journalId });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.deleteJournalEntry', {
        journalId
      });

      this.logger.debug('Successfully deleted journal entry', {
        deletedId: result.deletedId,
        deletedName: result.deletedName
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to delete journal entry', error);
      throw new Error(`Failed to delete journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleAddJournalPage(args: any): Promise<any> {
    const schema = z.object({
      journalId: z.string(),
      pageName: z.string(),
      content: z.string(),
      pageType: z.enum(['text', 'image', 'pdf', 'video']).default('text'),
      sort: z.number().optional()
    });

    const { journalId, pageName, content, pageType, sort } = schema.parse(args);

    this.logger.info('Adding journal page', { journalId, pageName, pageType });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.addJournalPage', {
        journalId,
        pageName,
        content,
        pageType,
        sort
      });

      this.logger.debug('Successfully added journal page', {
        journalId: result.journalId,
        pageId: result.pageId,
        pageName: result.pageName
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to add journal page', error);
      throw new Error(`Failed to add journal page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetJournalEntry(args: any): Promise<any> {
    const schema = z.object({
      journalId: z.string(),
      includeContent: z.boolean().default(false)
    });

    const { journalId, includeContent } = schema.parse(args);

    this.logger.info('Getting journal entry details', { journalId, includeContent });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.getJournalEntry', {
        journalId,
        includeContent
      });

      this.logger.debug('Successfully retrieved journal entry', {
        id: result.id,
        name: result.name,
        totalPages: result.totalPages
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to get journal entry', error);
      throw new Error(`Failed to get journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleUpdateJournalPage(args: any): Promise<any> {
    const schema = z.object({
      journalId: z.string(),
      pageId: z.string(),
      updates: z.object({
        name: z.string().optional(),
        content: z.string().optional(),
        sort: z.number().optional()
      })
    });

    const { journalId, pageId, updates } = schema.parse(args);

    this.logger.info('Updating journal page', { journalId, pageId, updates: Object.keys(updates) });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.updateJournalPage', {
        journalId,
        pageId,
        updates
      });

      this.logger.debug('Successfully updated journal page', {
        journalId: result.journalId,
        pageId: result.pageId,
        pageName: result.pageName
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to update journal page', error);
      throw new Error(`Failed to update journal page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleDeleteJournalPage(args: any): Promise<any> {
    const schema = z.object({
      journalId: z.string(),
      pageId: z.string(),
      confirmDeletion: z.boolean().default(false)
    });

    const { journalId, pageId, confirmDeletion } = schema.parse(args);

    if (!confirmDeletion) {
      throw new Error('Deletion not confirmed. Set confirmDeletion to true.');
    }

    this.logger.info('Deleting journal page', { journalId, pageId });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.deleteJournalPage', {
        journalId,
        pageId
      });

      this.logger.debug('Successfully deleted journal page', {
        journalId: result.journalId,
        deletedPageId: result.deletedPageId,
        deletedPageName: result.deletedPageName
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to delete journal page', error);
      throw new Error(`Failed to delete journal page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}