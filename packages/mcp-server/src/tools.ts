import { CharacterTools } from './tools/character.js';
import { CompendiumTools } from './tools/compendium.js';
import { SceneTools } from './tools/scene.js';
import { ActorCreationTools } from './tools/actor-creation.js';
import { QuestCreationTools } from './tools/quest-creation.js';
import { DiceRollTools } from './tools/dice-roll.js';
import { CampaignManagementTools } from './tools/campaign-management.js';
import { OwnershipTools } from './tools/ownership.js';
import { MapGenerationTools } from './tools/map-generation.js';
import { TokenManipulationTools } from './tools/token-manipulation.js';
import { JournalTools } from './tools/journal.js';
import { DSA5CharacterCreator } from './systems/dsa5/character-creator.js';

import { FoundryClient } from './foundry-client.js';
import { Logger } from './logger.js';

export interface ToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
  systemRegistry?: any;
  backendComfyUIHandlers?: any;
}

export class ToolsRegistry {
  private characterTools: CharacterTools;
  private compendiumTools: CompendiumTools;
  private sceneTools: SceneTools;
  private actorCreationTools: ActorCreationTools;
  private questCreationTools: QuestCreationTools;
  private diceRollTools: DiceRollTools;
  private campaignManagementTools: CampaignManagementTools;
  private ownershipTools: OwnershipTools;
  private mapGenerationTools: MapGenerationTools;
  private tokenManipulationTools: TokenManipulationTools;
  private journalTools: JournalTools;
  private dsa5CharacterCreator: DSA5CharacterCreator;

  constructor(options: ToolsOptions) {
    const { foundryClient, logger, systemRegistry, backendComfyUIHandlers } = options;

    this.characterTools = new CharacterTools({ foundryClient, logger, systemRegistry });
    this.compendiumTools = new CompendiumTools({ foundryClient, logger, systemRegistry });
    this.sceneTools = new SceneTools({ foundryClient, logger });
    this.actorCreationTools = new ActorCreationTools({ foundryClient, logger });
    this.dsa5CharacterCreator = new DSA5CharacterCreator({ foundryClient, logger });
    this.questCreationTools = new QuestCreationTools({ foundryClient, logger });
    this.diceRollTools = new DiceRollTools({ foundryClient, logger });
    this.campaignManagementTools = new CampaignManagementTools(foundryClient, logger);
    this.ownershipTools = new OwnershipTools({ foundryClient, logger });
    this.tokenManipulationTools = new TokenManipulationTools({ foundryClient, logger });
    this.journalTools = new JournalTools({ foundryClient, logger });

    // Map generation tools need special initialization
    this.mapGenerationTools = new MapGenerationTools({
      foundryClient,
      logger,
      backendComfyUIHandlers
    });
  }

  /**
   * Get all tool definitions for the MCP server
   */
  getAllToolDefinitions() {
    return [
      ...this.characterTools.getToolDefinitions(),
      ...this.compendiumTools.getToolDefinitions(),
      ...this.sceneTools.getToolDefinitions(),
      ...this.actorCreationTools.getToolDefinitions(),
      ...this.dsa5CharacterCreator.getToolDefinitions(),
      ...this.questCreationTools.getToolDefinitions(),
      ...this.diceRollTools.getToolDefinitions(),
      ...this.campaignManagementTools.getToolDefinitions(),
      ...this.ownershipTools.getToolDefinitions(),
      ...this.tokenManipulationTools.getToolDefinitions(),
      ...this.journalTools.getToolDefinitions(),
      ...this.mapGenerationTools.getToolDefinitions(),
    ];
  }

  /**
   * Handle tool calls
   */
  async handleToolCall(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      // Character tools
      case 'get-character-info':
        return await this.characterTools.handleGetCharacterInfo(args);
      case 'list-actors':
        return await this.characterTools.handleListActors(args);
      case 'create-character':
        return await this.characterTools.handleCreateCharacter(args);

      // Compendium tools
      case 'search-compendium':
        return await this.compendiumTools.handleSearchCompendium(args);
      case 'list-creatures-by-criteria':
        return await this.compendiumTools.handleListCreaturesByCriteria(args);
      case 'get-available-packs':
        return await this.compendiumTools.handleGetAvailablePacks(args);

      // Scene tools
      case 'get-current-scene':
        return await this.sceneTools.handleGetCurrentScene(args);
      case 'get-world-info':
        return await this.sceneTools.handleGetWorldInfo(args);

      // Actor creation tools
      case 'create-actor-from-compendium':
        return await this.actorCreationTools.handleCreateActorFromCompendium(args);

      // DSA5 character creator
      case 'create-dsa5-character':
        return await this.dsa5CharacterCreator.handleCreateDSA5Character(args);

      // Quest creation tools
      case 'create-quest':
        return await this.questCreationTools.handleCreateQuest(args);

      // Dice roll tools
      case 'roll-dice':
        return await this.diceRollTools.handleRollDice(args);

      // Campaign management tools
      case 'create-campaign-dashboard':
        return await this.campaignManagementTools.handleCreateCampaignDashboard(args);

      // Ownership tools
      case 'assign-actor-ownership':
        return await this.ownershipTools.handleToolCall('assign-actor-ownership', args);
      case 'remove-actor-ownership':
        return await this.ownershipTools.handleToolCall('remove-actor-ownership', args);
      case 'list-actor-ownership':
        return await this.ownershipTools.handleToolCall('list-actor-ownership', args);

      // Token manipulation tools
      case 'move-token':
        return await this.tokenManipulationTools.handleMoveToken(args);
      case 'update-token':
        return await this.tokenManipulationTools.handleUpdateToken(args);
      case 'delete-tokens':
        return await this.tokenManipulationTools.handleDeleteTokens(args);
      case 'get-token-details':
        return await this.tokenManipulationTools.handleGetTokenDetails(args);
      case 'toggle-token-condition':
        return await this.tokenManipulationTools.handleToggleTokenCondition(args);
      case 'get-available-conditions':
        return await this.tokenManipulationTools.handleGetAvailableConditions(args);

      // Journal tools
      case 'create-journal-entry':
        return await this.journalTools.handleCreateJournalEntry(args);
      case 'update-journal-entry':
        return await this.journalTools.handleUpdateJournalEntry(args);
      case 'delete-journal-entry':
        return await this.journalTools.handleDeleteJournalEntry(args);
      case 'add-journal-page':
        return await this.journalTools.handleAddJournalPage(args);
      case 'get-journal-entry':
        return await this.journalTools.handleGetJournalEntry(args);
      case 'update-journal-page':
        return await this.journalTools.handleUpdateJournalPage(args);
      case 'delete-journal-page':
        return await this.journalTools.handleDeleteJournalPage(args);

      // Map generation tools
      case 'generate-map':
        return await this.mapGenerationTools.generateMap(args);
      case 'check-map-status':
        return await this.mapGenerationTools.checkMapStatus(args);
      case 'cancel-map-job':
        return await this.mapGenerationTools.cancelMapJob(args);
      case 'list-scenes':
        return await this.mapGenerationTools.listScenes(args);
      case 'switch-scene':
        return await this.mapGenerationTools.switchScene(args);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // Expose individual tools for direct access if needed
  get characterTools() { return this.characterTools; }
  get compendiumTools() { return this.compendiumTools; }
  get sceneTools() { return this.sceneTools; }
  get actorCreationTools() { return this.actorCreationTools; }
  get questCreationTools() { return this.questCreationTools; }
  get diceRollTools() { return this.diceRollTools; }
  get campaignManagementTools() { return this.campaignManagementTools; }
  get ownershipTools() { return this.ownershipTools; }
  get tokenManipulationTools() { return this.tokenManipulationTools; }
  get journalTools() { return this.journalTools; }
  get mapGenerationTools() { return this.mapGenerationTools; }
  get dsa5CharacterCreator() { return this.dsa5CharacterCreator; }
}