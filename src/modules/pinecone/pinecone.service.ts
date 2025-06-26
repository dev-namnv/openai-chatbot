import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Index, Pinecone } from '@pinecone-database/pinecone';
import slugify from 'slugify';
import configuration from 'src/config/configuration';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class PineconeService implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => OpenAIService))
    private readonly openAIService: OpenAIService,
  ) {}
  private pinecone: Pinecone;
  private index: Index;

  async onModuleInit() {
    this.pinecone = new Pinecone({
      apiKey: configuration().pinecone.apiKey,
    });

    this.index = this.pinecone.Index(configuration().pinecone.indexName);
  }

  async createIndex() {
    return this.pinecone.createIndexForModel({
      name: 'integrated-dense-js',
      cloud: 'aws',
      region: 'us-east-1',
      embed: {
        model: 'llama-text-embed-v2',
        fieldMap: { text: 'chunk_text' },
      },
      waitUntilReady: true,
    });
  }

  async upsertVector(
    id: string,
    embedding: number[],
    metadata: Record<string, any>,
  ) {
    await this.index.upsert([
      {
        id,
        values: embedding,
        metadata,
      },
    ]);
  }

  async queryVector(values: number[], topK = 3) {
    const result = await this.index.query({
      vector: values,
      topK,
      includeMetadata: true,
    });
    return result.matches;
  }

  async getContextByQuestion(question: string): Promise<string> {
    // Step 1: Embed the question
    const embedding = await this.openAIService.getEmbedding(question);

    // Step 2: Query Pinecone
    const results = await this.queryVector(embedding, 3);
    const context = results
      .filter((r) => r.score >= 0.75)
      .map((r) => r.metadata.text)
      .join('\n---\n');

    if (context) {
      return context;
    }

    // Step 4: Get Definition from OpenAI if the context can be found.
    const definition = await this.openAIService.getDefinition(question);

    // Step 5: Create embedding from that definition
    const definitionEmbedding =
      await this.openAIService.getEmbedding(definition);

    // Step 6: Upsert to Pinecone
    await this.upsertVector(slugify(question), definitionEmbedding, {
      text: definition,
    });

    // Step 7: Query by the embedding of definition
    const updatedResults = await this.queryVector(definitionEmbedding, 3);
    const updatedContext = updatedResults
      .filter((r) => r.score >= 0.75)
      .map((r) => r.metadata.text)
      .join('\n---\n');

    if (!updatedContext) {
      throw new NotFoundException('Context was not found even after upsert');
    }

    return updatedContext;
  }

  async deleteVector(id: string) {
    await this.index.deleteOne(id);
  }
}
